var mongodb = require('mongodb');
var Twitter = require('twitter');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/twitter';
var connection = MongoClient.connect(url);

require('dotenv').config();

var db_name = 'favorite_tweets';

var client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

function getCategories() {
    return new Promise(function (resolve, reject) {
        connection.then(function (db) {
            var collection = db.collection(db_name);
            collection.distinct('category', function (error, categories) {
                if (error) {
                    reject(error.message);
                } else {
                    resolve(categories);
                }
            });
        });
    });
}

function getRecentTweets(limit) {
    return new Promise(function (resolve, reject) {
        connection.then(function (db) {
            var collection = db.collection(db_name);
            collection.find().sort({ id: -1 }).collation({locale: "en_US", numericOrdering: true}).limit(limit).toArray(
                function (error, tweets) {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(tweets);
                    }
                }
            );
        });
    });
}

function setCategory(id, category) {
    return new Promise(function (resolve, reject) {
        connection.then(function (db) {
            var collection = db.collection(db_name);
            collection.updateOne({ id: id }, { $set: { 'category': category } }, function (error, res) {
                if (error) {
                    reject(error.message);
                } else {
                    resolve();
                }
            });
        });
    });
}

function markTweet(id, isRead) {
    return new Promise(function (resolve, reject) {
        connection.then(function (db) {
            var collection = db.collection(db_name);
            collection.updateOne({ id: id }, { $set: { 'isRead': isRead } }, function (error, res) {
                if (error) {
                    reject(error.message);
                } else {
                    resolve();
                }
            });
        });
    });
}

function searchTweets(query, username, isRead, category) {
    return new Promise(function (resolve, reject) {
        connection.then(function (db) {
            var collection = db.collection(db_name);
            var findQuery = JSON.parse(JSON.stringify({
                "name": username,
                "isRead": isRead,
                "category": category
            }));

            if (typeof query != 'undefined') {
                findQuery["$text"] = { "$search": query };
            }

            var scoreQuery = {
                "score": { "$meta": "textScore" }
            };

            collection.find(findQuery, scoreQuery).sort(scoreQuery).toArray(
                function (error, tweets) {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(tweets);
                    }
                }
            );
        });
    });
};

function fetchTweets() {
    return new Promise(function(resolve, reject) {
        getTweets([]).then(tweets => insertTweets(tweets))
        .then(function() {
            resolve();
        })
        .catch(err => console.log(err));
    });
    
}

function getTweets(allTweets, maxId) {
    return new Promise(function (resolve, reject) {
        client.get('favorites/list', { max_id: maxId }, function (error, tweets, response) {
            if (error) {
                if (error[0].message == "Rate limit exceeded") {
                    reject("Rate limit exceeded.");
                } else {
                    resolve(tweets);
                }
            }

            else {
                allTweets = allTweets.concat(tweets);
                var oldest = tweets[tweets.length - 1];

                sleep(8000).then(() => {
                    resolve(getTweets(allTweets, oldest.id));
                });
            }

        });
    });
}


function insertTweets(tweets) {
    return new Promise(function (resolve, reject) {
        connection.then(function (db) {
            var collection = db.collection(db_name);

            // If collection hasn't existed yet, set
            // "text" as index
            collectionExists(db_name).then(function (exists) {
                if (!exists) {
                    collection.createIndex({ "text": "text" });
                };
            });

            for (var index in tweets) {
                var tweet = tweets[index];
                
                var id = String(tweet.id);
                var text = tweet.text;
                var name = tweet.user.screen_name;
                var timestamp = tweet.created_at;
                var isRead = 'false';
                var category = 'Uncategorized';
                var tweet = {"id": id, "timestamp": timestamp, "name": name, "text": text, "isRead": isRead, "category": category};

                collection.update({ id: tweet.id }, { $setOnInsert: tweet }, { upsert: true },
                    function (error) {
                        if (error) {
                            reject(error.message);
                        }
                    }
                );
            };

            resolve();

        });
    });
}

function collectionExists(collName) {
    return new Promise(function (resolve, reject) {
        connection.then(function (db) {
            db.listCollections().toArray(
                function (error, collections) {
                    if (error) {
                        reject(error.message);
                    } else {
                        collections.some(function (coll) {
                            resolve(coll.name == collName);
                        });
                    }
                }
            );
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    markTweet,
    searchTweets,
    setCategory,
    getCategories,
    getRecentTweets,
    fetchTweets
 }