var Genius = require("node-genius");
var Lyricist = require('lyricist');
var accessToken = require('dotenv').config();

var access_token = process.env.GENIUS_ACCESS_TOKEN
var geniusClient = new Genius(access_token);
var lyricist = new Lyricist(access_token);

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
    await getSongsByArtistID(artistId);
}

// Returns a list of songs by an artist 
// given an artist ID.
async function getSongsByArtistID(artistID) {
    var songs = await lyricist.songsByArtist(artistID);
    songs.forEach(function(song) { 
        console.log(song.title + " (" + song.id + ")"); 
    });
}

// Returns songs lyrics given a song ID.
async function getSongLyricsByID(songID) {
    var song = await lyricist.song(songID, { fetchLyrics: true });
    console.log(song.lyrics);
}

// Run the CLI application.
function runCli() {
    // Removes the first two elements, which consists
    // of the absolute pathname of the executable
    // that started the Node.js process and the file that
    // is being executed.
    var userArgs = process.argv.slice(2);
    var searchBy = userArgs[0];
    var query = userArgs[1];

    if (searchBy == "song") {
        getSongLyricsByID(query);
    } else if (searchBy == "artist") {
        getSongsByArtist(query);
    } else {
        console.log("Wrong options: song or artist");
    }
}

runCli();
