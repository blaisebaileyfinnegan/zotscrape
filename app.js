#!/usr/bin/env node

var request = require('request');
var async = require('async');
var cheerio = require('cheerio');

var cfg = require('./cfg/cfg');
var output = require('./lib/output');
var scraper = require('./lib/scraper');
var post = require('./lib/post');
var parser = require('./lib/parser');

// Output dependency
var db = require('./lib/db');

scraper = new scraper(cheerio, cfg, parser, async);

function deptsIterator(formdata) {
    return function (dept, callback) {
        formdata.Dept = dept;

        post.requestDepartment(request, cfg.url, formdata, function(error, body) {
            if (error) throw error;

            // Request succeeded. Parse.
            var department = scraper.department(formdata.Dept, body);
            callback(null, department);
        });
    }
}

var finalStep = function (err, result) {
    if (err) throw err;

    // Output to whatever
    var str = JSON.stringify(result);
    output.toFile('output.txt', str);

    // Output to db
    output.toDB(db, async, result, function(err) {
        // On finish, end our connection
        db.destroy();
    });
}

if (process.argv.length == 3) {
    var file = __dirname + '/' + process.argv[2];
    var fs = require('fs');

    fs.readFile(file, 'utf8', function (err, data) {
        if (err) throw err;

        data = JSON.parse(data);
        finalStep(null, data);
    });

} else {
    // One step at a time
    async.waterfall([
        function (callback) {
            // Request the main WebSOC page and pass the body
            post.requestMain(request, cfg.url, callback);
        },
        function (body, callback) {
            // Get all the departments
            callback(null, scraper.departmentValues(body));
        },
        function (values, callback) {
            // Nest departments within each quarter
            var quarters = [];
            for (quarter in cfg.quarters) {
                quarter = {
                    termCode: quarter,
                    yearTerm: cfg.quarters[quarter],
                    depts: values
                }
                
                quarters.push(quarter);
            }

            callback(null, quarters);
        },
        function (quarters, next) {
            // Request courses from each department for each quarter
            async.mapSeries(quarters, function (quarter, callback) {
                var formdata = cfg.formdata;
                formdata.YearTerm = quarter.yearTerm;

                async.mapSeries(quarter.depts, deptsIterator(formdata), function (err, departments) {
                    // Departments are done for this quarter
                    console.log(quarter.termCode);
                    callback(err, {
                        quarter: quarter.termCode,
                        departments: departments
                    });
                });
            }, function (err, quarters) {
                // All quarters are done
                next(err, quarters);
            });
        },
    ], finalStep);
}
