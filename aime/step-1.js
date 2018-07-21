#! /usr/bin/env node
'use strict';

/*
*   Step 1
*   Setting up the grids
*/

var blessed = require('blessed');
var contrib = require('blessed-contrib');
var chalk = require('chalk');
var program = require('commander');
var twitter = require(__dirname + '/twitter.js');
var utils = require(__dirname + '/utils.js');

require('dotenv').config();

var screen = blessed.screen(
    {
        fullUnicode: true, // enables unicode, otherwise unicode texts 
                           // will show up as question marks
        smartCSR: true, // enables change-scroll-region, for a more 
                        // efficient rendering
        title: 'aime ❤️'
    });

// Returns a JavaScript object containing styling
// configuration for regular boxes.
function boxOptions(label) {
    return {
        label: chalk.bold(chalk.white(label)),
        tags: false, // disable the usage of tags, like {bold}text{/bold}
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

// Returns a JavaScript object containing styling
// configuration for scrollable boxes.
function scrollBoxOptions(label) {
    var options = boxOptions(label); // inherits the boxOptions because we want the same style
    options.scrollable = true; // makes the box scrollable
    options.scrollbar = { ch: ' ', inverse: true }; // determines scrolling direction
    options.style.scrollbar = { bg: 'white', fg: 'white' }
    options.alwaysScroll = true;
    options.keys = true; // enables scrolling using keys (up/down)
    options.mouse = true; // enables scrolling using the mouse/mousepad
    return options;
}

function textboxOptions(label) {
    var options = boxOptions(label); // inherits the boxOptions because we want the same style
    options.inputOnFocus = true;
    
    return options;
}

// Makes a grid of 12 rows and 12 columns
var grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

// Set up each individual grid
// grid.set(row, col, rowSpan, colSpan, options)
var likedTweetsBox = grid.set(0, 0, 12, 6, blessed.box, boxOptions(' Recent Likes ❤️ '));
var consoleBox = grid.set(7, 8, 1, 4, blessed.textbox, textboxOptions(' Command ✏️ '));
var consoleBoxWindow = grid.set(8, 6, 4, 6, blessed.box, scrollBoxOptions(''));
var categoriesBox = grid.set(0, 6, 8, 2, blessed.box, boxOptions(' Categories 📝 '));
var helpBox = grid.set(0, 8, 7, 4, blessed.box, boxOptions(' ℹ️ '));

// Quit the application using esc, 'q', or
// control + C.
// Will be explained more thoroughly in Step 4.
screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
});

// Render changes to screen
// Every time we manipulate the screen, we have
// to render our screen to get our changes rendered.
screen.render();