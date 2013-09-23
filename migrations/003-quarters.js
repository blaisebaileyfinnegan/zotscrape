var connection = require('./../lib/db');
var fs = require('fs');

var options = {
    encoding: 'utf8'
}

exports.up = function(next) {
    fs.readFile(__dirname + '/003-quarters-up.sql', options, function (err, queries) {
        if (err) throw err;

        connection.query(queries, function (err, results) {
            if (err) throw err;

            connection.destroy();
            next();
        });

    });

};

exports.down = function(next) {
    fs.readFile(__dirname + '/003-quarters-down.sql', options, function (err, queries) {
        if (err) throw err;

        connection.query(queries, function (err, results) {
            if (err) throw err;

            connection.destroy();
            next();
        });
    });
};
