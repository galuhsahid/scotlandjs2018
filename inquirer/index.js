var Genius = require("node-genius");
var Lyricist = require('lyricist');
var accessToken = require('dotenv').config();

var access_token = process.env.GENIUS_ACCESS_TOKEN
var geniusClient = new Genius(access_token);
var lyricist = new Lyricist(access_token);
var inquirer = require('inquirer');
var colors = require('colors');
var figlet = require('figlet');

// Define an inquirer prompt to search for artist
// with the type of input text.
var searchArtistPrompt = {
    type: 'input',
    name: 'artist',
    message: 'Search an artist:'
}

// Define an inquirer prompt to choose songs
// with the type of list and a default value of
// empty list, in case no songs are found for a given
// artist ID.
var chooseSongPrompt = {
    type: 'list',
    name: 'songs',
    message: 'Pick a song:',
    choices: []
}

// Returns the artist ID given a string of the artist's
// name.
function searchArtistID(artist) {
    return new Promise(function (resolve, reject) {
        geniusClient.search(artist, function (err, results) {
            if (err) reject(err);
            else {
                results = JSON.parse(results);
                artistID = results.response.hits[0].result.primary_artist.id;
                resolve(artistID);
            }
          });
    });
}

// Returns a list of songs by an artist given
// a string of the artist's name.
async function getSongsByArtist(artist) {
    var artistId = await searchArtistID(artist);
    return getSongsByArtistID(artistId);
}

// Returns a list of songs by an artist 
// given an artist ID.
async function getSongsByArtistID(artistID) {
    var songs = await lyricist.songsByArtist(artistID);
    var allSongs = [];

    for (var i = 0, len = songs.length; i < len; ++i) {
        allSongs[songs[i].title] = songs[i].id;
    }

    return allSongs;
}

// Returns songs lyrics given a song ID.
async function getSongLyricsByID(songID) {
    var song = await lyricist.song(songID, { fetchLyrics: true });
    console.log(song.lyrics.underline.red);
}

// A function to run inquirer's searchArtistPrompt.
// The function gets the artist name from the user
// input, which will then be used to get the list
// of songs by that artist.
// When a list of songs is already returned,
// we will call the function chooseSong which is
// another function to run inquirer's chooseSong prompt.
function chooseArtist() {
    inquirer.prompt(searchArtistPrompt).then(answer => {
        var artist = answer["artist"];
        
        getSongsByArtist(artist).then(chooseSong);
    });
}

// A function to run inquirer's chooseSongPrompt.
// It takes the list of songs returned from the
// getSongsByArtist(artist) function as the prompt's
// choices. Once selected, the selected value will
// be passed to the getSongLyricsByID() function
// which will then display the lyrics of that song.
function chooseSong(allSongs) {
    songTitles = Object.keys(allSongs);
    chooseSongPrompt["choices"] = songTitles;
       
    inquirer.prompt(chooseSongPrompt).then(answer => {
        chosenSong = answer["songs"];
        getSongLyricsByID(allSongs[chosenSong]);
    });
}

// Display ASCII text from piglet which is
// colored yellow.
function displayFiglet() {
    console.log(
        figlet.textSync('lyrical', { horizontalLayout: 'full' })
        .yellow
    );
}

// Run the CLI application by displaying figlet
// and initiating the chooseArtist prompt.
function runCli() {
    displayFiglet();
    chooseArtist();
}

runCli();