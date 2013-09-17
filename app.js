var request = require('request');
var async = require('async');
var cheerio = require('cheerio');

var cfg = require('./cfg/cfg');
var output = require('./lib/output');
var scraper = require('./lib/scraper');
var post = require('./lib/post');

// Output dependency
var db = require('./lib/db');

scraper = new scraper(cheerio, cfg, 'AC ENG');

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
], function (err, result) {
    // Output to whatever
    var str = JSON.stringify(result);
    output.toFile('output.txt', str);
});
