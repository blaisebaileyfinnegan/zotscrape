var request = require('request');
var async = require('async');
var cheerio = require('cheerio');

var cfg = require('./cfg/cfg');
var output = require('./lib/output');
var scraper = require('./lib/scraper');

scraper = new scraper(cheerio, cfg, 'BATS');

async.waterfall([
	function (callback) {
		// Request the main WebSOC page and pass the body
		request(cfg.url, function (error, response, body) {
			if (error) throw error;
			
			if (response.statusCode != 200) throw new Error('Non-200 response returned from ' + response.request.href );
			
			callback(null, body);
		});
	},
	function (body, callback) {
        // Get all the departments
		callback(null, scraper.departmentValues(body));
	},
	function (values, callback) {
        // Request courses from each department
		async.mapSeries(values, function (item, callback) {
			var formdata = cfg.formdata;
			formdata.Dept = item;
			
			request.post({url: cfg.url, form: formdata}, function(error, response, body) {
                console.log('Parsing ' + formdata.Dept);
				var department = scraper.department(formdata.Dept, body);
				callback(null, department);
			});
		}, function (err, departments) {
			callback(err, departments);
		});
	},
], function (err, result) {
    var str = JSON.stringify(result);
    output.toFile('output.txt', str);
});
