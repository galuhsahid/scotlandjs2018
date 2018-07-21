var Genius = require("node-genius");
var Lyricist = require('lyricist');
var dotenv = require('dotenv').config();
var program = require('commander');

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
    // Creates the commander program along with the available options.
    // Angled brackets mean the arguments are required, whereas
    // squared brackets mean the arguments are optional.
    program
    .command('song <songId>')
    .option('-l, --lowercase', 'Return song lyrics in lowercase')
    .alias('s')
    .description('Find song lyrics by songId')

    .action(
        function (song, args) {
            getSongLyricsByID(song, args.lowercase)
        });

    program
    .command('artist <name>')
    .alias('a')
    .description('Find list of songs by artist')

    .action(
        function (artist) {
            getSongsByArtist(artist)
        });

    program.parse(process.argv);

}

runCli();
