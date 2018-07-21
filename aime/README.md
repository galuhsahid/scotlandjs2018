# aime
This folder contains step-by-step codes to build aime.

## setup
aime needs your Twitter account's **API keys** to work.

1. Find out how to get your access token [here](https://dev.twitter.com/oauth/overview/application-owner-access-tokens) &amp; do all the steps necessary.
2. Export the following variables

```
export CONSUMER_KEY = '[ your consumer_key here ]'
export CONSUMER_SECRET= '[ your consumer_secret here ]'
export ACCESS_TOKEN = '[ your access_token here ]'
export ACCESS_TOKEN_SECRET = '[your access_token_secret here]'
```

You only need to do this once.

## steps
### step 1: setting up the grids
Let's start by setting up the grids. First, we initialize a screen object from blessed. The purpose of the screen object is as a primary object where we render our stuff on the screen. Here we create a screen called 'aime', which uses `smartCSR` for a more efficient rendering, we also allow unicode here. Otherwise we will see unicode combining characters as question marks.

Next, let's initialize our grid. Here I'm making a grid with 12 rows and columns. The objects I'm using are blessed.box and blessed.textbox for the console.

I define each box by creating five different grids, each containing either a blessed.box or blessed.textbox. We have to use absolute positioning here so we define the row, column, as well as how many columns and rows each box spans. The last parameter over there accepts options, where we define the style of our box, such as label, border color, etc. I have three different options:
- boxOptions: some basic styling like the line, etc.
- textboxOptions: set `inputOnFocus = True`.
- scrollboxOptions: a regular box that can be scrolled, for box that contains a long result.

Then, we do `screen.render()`. Every time we manipulate our screen we will have to call `screen.render()` for our changes to be rendered.

### step 2: display some texts
The next part is displaying some text inside our boxes. I want to display recently liked tweets, list of categories, help message.

This is an example of a function that displays the list of categories in the box:

```
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
```

I call another function which returns a json and I set the content by calling `categoriesBox.content =` whatever string I want to put.

### step 3: command prompt box
First let's figure out how we can get our command prompt box to listen to our input.

At this point we can type in our box by clicking the box. When we press enter nothing happens yet. Remember that we're using blessed's textbox object, and textbox can listen to an event called "submit" which happens when we press enter. It will return the text that is submitted by the user. To check if it gets our value let's try to show it in our resultsBox.

OK, now we need to parse our commands. We need the help of another library because blessed doesn't come with any capability to parse command line arguments. Some examples of our commands:

Find tweets containing the word paper:
search -q paper

Find tweets containing the word paper by @userxyz:
search -q paper -u userxyz

Set the category tweet 24234242 to "ML":
set 24234242 ML

There's a certain structure here, we have a few different commands and each of them has their own subcommand. I chose to use commander.js because they're pretty flexible: you can have a single command with no options, or you can have multiple commands with multiple options for each. 

Let's set up our commander programs, with the command for "search" as the example. Here's how our commander program will look like:

```
...

program
    .command('search')
    .alias('s')
    .description('Search for tweets')
    .option('-q, --query [value]', 'Query')
    .option('-u, --username [value]', "Username")
    .option('-r, --read [value]', "Whether it has been read or not")
    .option('-c, --category [value]', "Category")

    .action(function (args) {
        // do stuff
    });
```

The arguments received by commander will be passed into action, and we can use these arguments to do whatever we want to do. In this case we want to search for tweets we've liked according to its content, username, category, or whether it has been read or not. 

Maybe you've noticed that at this point there's no way for our user input to communicate with commander... yet. 

Commander usually parses arguments from process.argv. If we were to type the command `search -q paper` in a regular command line program, we'll have process.argv that looks like this:

```
[ '/usr/local/bin/node',
  '/Users/galuh.sahid/Documents/aime/index.js',
  'search',
  '-q',
  'paper' ]
```

But our case is different. What we have right now is a regular "search -q paper" string instead of the usual list returned by `process.argv`, so we have to get a little bit "hacky" by turning our string into the list returned by process.argv so commander can process it.

We can do this by turning our string into a list and concatenating it with the `process.argv` of our program, which is just this part:

```
[ '/usr/local/bin/node',
  '/Users/galuh.sahid/Documents/aime/index.js']
```

Because we're not running it with any argument, we just have `node dashboard.js`, our `process.argv` will only consist of these two parts. Then our user input will complete the list:

```
    var toParse = process.argv.concat(text.split(" "));
    program.parse(toParse);
```

Great, now that our user input and commander program are connected, let's complete our commander program. We now can fill this part with whatever we want our program to do once it gets the command line arguments. In my case I'm using my searchTweets function and passes all the arguments, it to my function, and it will return a list of tweets that fulfill my arguments. 

We also have to render our screen again; if we run any code that manipulates the screen, we have to call `screen.render()` to render our changes.

### step 4: key bindings
This being a CLI application, we're going to depend a lot on keys to navigate our application. For more advanced actions I guess you can create buttons and apply the proper event handling, but for simple navigation you can utilize key bindings. When using blessed you can't quit your application using ctrl+c by default, so you have to define it yourself first. In my case I bind the keys escape, q, and control + c to a function that returns process.exit(0) which signifies that the application has been run successfully:

```
// Quit: esc, c, ctrl+c
screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
});

function refresh() {
    displayRecent();
    displayCategories();
    promptBox.content = '';
    resultsBox.content = '';
    screen.render();
}

// Refresh: r, ctrl+r
screen.key(['r', 'C-r'], function (ch, key) {
    refresh();
});
```

I also define the keys r and control + C as refresh. The definition of refresh depends on each application; in my case, when someone refreshes the application I want it to display the most recent categories, tweets, and empties out the box where I type my command in.