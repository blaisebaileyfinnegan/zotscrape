var connection = require('./../lib/db');
var fs = require('fs');

var options = {
    encoding: 'utf8'
}

exports.up = function(next) {
    fs.readFile(__dirname + '/002-instructors-up.sql', options, function (err, queries) {
        if (err) throw err;

        connection.query(queries, function (err, results) {
            if (err) throw err;

            next();
        });

    });

};

exports.down = function(next) {
    fs.readFile(__dirname + '/002-instructors-down.sql', options, function (err, queries) {
        if (err) throw err;

        connection.query(queries, function (err, results) {
            if (err) throw err;

            next();
        });
    });
};
