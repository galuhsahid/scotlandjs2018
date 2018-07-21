var chalk = require('chalk');

function formatAMPM(timestamp) {
    var hours = timestamp.getHours();
    var minutes = timestamp.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;

    return strTime;
}

function formatTimestamp(timestamp) {
    timestamp = new Date(timestamp);

    var year = timestamp.getFullYear();
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var month = monthNames[timestamp.getMonth()];
    var date = timestamp.getDate();
    var time = formatAMPM(timestamp);

    var formattedTimestamp = time + " - " + date + " " + month + " " + year

    return formattedTimestamp;
}

function formatTweets(tweets) {
    var formattedTweets = [];

    for (var index in tweets) {
        tweet = tweets[index];
        var id = tweet.id;
        var name = tweet.name;
        var timestamp = formatTimestamp(tweet.timestamp);
        var text = tweet.text + "\n";
        var isRead = tweet.isRead;
        var category = tweet.category;

        if (isRead == true) {
            isRead = ' | ✅️️';
        } else {
            isRead = '';
        }

        if (typeof(category) === "undefined") {
            category = "Uncategorized";
        }

        var meta = chalk.green(timestamp) + " | " + chalk.magenta(category) + " | " + chalk.yellow(id) + isRead + "\n";
        var name = "-- " + chalk.bold(chalk.red(name)) + "\n";

        var tweet = [meta + text + name];

        formattedTweets.push(tweet);
    }

    return formattedTweets;
}

module.exports.formatTweets = formatTweets;
