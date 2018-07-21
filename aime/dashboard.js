#! /usr/bin/env node
'use strict';

var blessed = require('blessed');
var contrib = require('blessed-contrib');
var chalk = require('chalk');
var program = require('commander');
var twitter = require(__dirname + '/twitter.js');
var utils = require(__dirname + '/utils.js');

require('dotenv').config();

var screen = blessed.screen(
    {
        fullUnicode: true,
        smartCSR: true,
        title: 'aime ❤️'
    });

// Styling configuration
function scrollBoxOptions(label) {
    var options = boxOptions(label);
    options.scrollable = true;
    options.scrollbar = { ch: ' ', inverse: true };
    options.style.scrollbar = { bg: 'white', fg: 'white' }
    options.alwaysScroll = true;
    options.keys = true;
    options.mouse = true;
    return options;
}

function boxOptions(label) {
    return {
        label: chalk.bold(chalk.white(label)),
        tags: false,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            border: { fg: 'cyan' },
            hover: { border: { fg: 'green' }, }
        }
    };
}

function textboxOptions(label) {
    var options = boxOptions(label);
    options.inputOnFocus = true;
    
    return options;
}

// Layout
var grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

var likedTweetsBox = grid.set(0, 0, 12, 6, blessed.box, boxOptions(' Recent Likes ❤️ '));
var consoleBox = grid.set(7, 8, 1, 4, blessed.textbox, textboxOptions(' Command ✏️ '));
var consoleBoxWindow = grid.set(8, 6, 4, 6, blessed.box, scrollBoxOptions(''));
var categoriesBox = grid.set(0, 6, 8, 2, blessed.box, boxOptions(' Categories 📝 '));
var helpBox = grid.set(0, 8, 7, 4, blessed.box, boxOptions(' ℹ️ '));

function start() {
    // Display default messages
    displayHelp();

    // Display recent tweets
    displayRecent();

    // Display categories
    displayCategories();
}

function displayHelp() {
    var helpMessage = 'aime ❤️   is a command line dashboard that lets you search & manage your Twitter likes.' +
        '\n\n' +
        chalk.bold('○ search -q <query> -u <username> -r <is_read> -c <category>') +
        '\n' +
        '  Search tweets. You can leave the parameters blank if you don\'t want to filter them.' +
        '\n\n' +
        chalk.bold('○ fetch') +
        '\n' +
        '  Fetch your liked tweets.' +
        '\n\n' +
        chalk.bold('○ mark -r <tweet_id> / mark -x <tweet_id>') +
        '\n' +
        '  Mark tweets as read/unread.' +
        '\n\n' +
        chalk.bold('○ set <tweet_id> <category_name>') +
        '\n' +
        '  Set category for a tweet. For now please use dash (-) as a replacement for space (e.g. Neural Networks becomes Neural-Networks).' +
        '\n\n' +
        'Press ' + chalk.bold('C or CTRL+C') + ' to quit, ' + chalk.bold('R or CTRL+R') +
        ' to refresh, and ' + chalk.bold('i') + ' to start writing your commands.';

    helpBox.content = helpMessage;
}

function displayCategories() {
    twitter.getCategories().then(function(categories) {
        if (categories.length == 0) {
            categoriesBox.content = '';
        } 
        else {
            categoriesBox.content = '○ ' + categories.join("\n○ ");
        }
        screen.render();
    });
}

function displayRecent() {
    twitter.getRecentTweets(6).then(function(tweets) {
        if (tweets.length == 0) {
            var emptyMessage = 'Bummer, you haven\'t added any tweets yet. But don\'t worry, it\'s easy!' +
                        '\n\n' +
                        '- Configure your Twitter profile settings.' +
                        '\n\n' +
                        '- Use the command fetch to fetch your liked tweets.' +
                        '\n\n' +
                        '- Once done, press the key R and you can see the five most recent tweets you have liked here.' +
                        '\n\n';
            
            likedTweetsBox.content = emptyMessage;

        } else {
            likedTweetsBox.content = utils.formatTweets(tweets).join('\n\n');
        }
        screen.render();
    });
}

// Command line program - Search
program
    .command('search')
    .alias('s')
    .description('Search for tweets')
    .option('-q, --query [value]', 'Query')
    .option('-u, --username [value]', "Username")
    .option('-r, --read [value]', "Whether it has been read or not")
    .option('-c, --category [value]', "Category")

    .action(function (args) {
        twitter.searchTweets(args.query, args.username, args.read, args.category)
        .then(function(tweets) {
            consoleBoxWindow.content = utils.formatTweets(tweets).join('\n\n');
            screen.render();
            args = reset(args);
        });
    });


program
.command('fetch')
.alias('f')
.description('Fetch liked tweets from Twitter')

.action(function (args) {
    var fetchMessage = 'Fetching your likes... ' +
    '\n\n' +
    'This might take a while, depending on the number of your likes. ' +
    '\n\n' +
    'Grab yourself a good cup of ☕ and check back later! I\'ll let you know when it\'s done. ' +
    '\n\n';
    consoleBoxWindow.setContent(fetchMessage);
    screen.render();

    twitter.fetchTweets().then(function() {
        consoleBoxWindow.setContent('All of your tweets have been fetched. Now celebrate! 🎉');
        screen.render();
    });
    
});

program
.command('mark <type>')
.alias('m')
.description('Mark tweet as read or unread')
.option('-r, --read', "Mark tweet as read")
.option('-u, --unread', "Mark tweet as unread")

.action(function (tweetID, args) {
    var isRead = args.read;
    var isUnread = args.unread;

    if (isRead && isUnread) {
        consoleBoxWindow.content = "Select one at a time.";
    }
    else if (isRead && !isUnread) {
        twitter.markTweet(tweetID, true).then(function() {
            consoleBoxWindow.content = "Your tweet has been marked as read. ✅️️";
            screen.render();
        });
    } else if (isUnread && !isRead) {
        twitter.markTweet(tweetID, false).then(function() {
            consoleBoxWindow.content = "Your tweet has been marked as unread.";
            screen.render();
        });
    }
});

program
.command('set <tweetId> [category]')
.alias('s')
.description('Set category to tweet')

.action(function (tweetID, category) {
    twitter.setCategory(tweetID, category).then(function() {
        consoleBoxWindow.content = "Tweet " + chalk.green(tweetID) + " is now categorized in " + chalk.green(category) + ".";
        screen.render();
    });
});

consoleBox.on('submit', (text) => {
    var toParse = process.argv.concat(text.split(" "));
    program.parse(toParse);
});

function reset(args) {
    args.options.forEach(function(option) {
        args[option.attributeName()] = option.defaultValue;
    });

    return args;
}

// Step 4: Key Bindings
// Makes the textbox focused when 'i' is pressed
screen.key('i', (ch, key) => {
    consoleBox.focus();
});

// Quit: esc, c, ctrl+c
screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
});

function refresh() {
    displayRecent();
    displayCategories();
    consoleBox.content = '';
    consoleBoxWindow.content = '';
    screen.render();
}

// Refresh: r, ctrl+r
screen.key(['r', 'C-r'], function (ch, key) {
    refresh();
});

start();

screen.render();
