var fs = require('fs');
var connection = require('./../lib/db');

var options = {
    encoding: 'utf8'
}

exports.up = function(next) {
    fs.readFile(__dirname + '/001-init-up.sql', options, function (err, queries) {
        if (err) throw err;

        connection.query(queries, function (err, results) {
            if (err) throw err;

            connection.destroy();
            next();
        });

    });

};

exports.down = function(next) {
    fs.readFile(__dirname + '/001-init-down.sql', options, function (err, queries) {
        if (err) throw err;

        connection.query(queries, function (err, results) {
            if (err) throw err;

            connection.destroy();
            next();
        });
    });
};
