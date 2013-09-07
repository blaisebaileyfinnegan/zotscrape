var request = require('request');
var async = require('async');
var cheerio = require('cheerio');

var cfg = require('./cfg/cfg');

var debug = true;

var scraper = {
	departmentValues: function(body) {
		// Get the values for the departments that we want
		$ = cheerio.load(body);
		var values = $('select[name="Dept"] > option').map(function () {
			return $(this).val()
		});
		
		values.shift() // Remove the 'ALL' option
		if (debug) {
			values = [values[0]];
		}
		
		return values;
	},
	
	department: function(body) {
		$ = cheerio.load(body);
		var table = $(".course-list > table");
				
		var collegeTitle = table.find('.college-title').text();
		var collegeComment = table.find('.college-comment').text();
				
		var deptTitleElement = table.find('.dept-title');
		var deptTitle = deptTitleElement.text()
		if (deptTitle) {
			var deptComment = deptTitleElement.next().text();
		}
				
		var courseTitleIndices = new Array();
		var endIndex = 0;
		var trs = table.children();
		trs.each(function(index) {
			if (this.is("tr[bgcolor='#fff0ff']:has(td.CourseTitle)")) {
				courseTitleIndices.push(index);
			}
		});
		
		if (courseTitleIndices.length > 0 ) {
			courseTitleIndices.push(trs.length);
		}
		
		// Divide our markup into distinct course sections
		var courseBlocks = new Array();
		for (var i = 0; i < courseTitleIndices.length - 1; i++) {
			courseBlocks.push(trs.slice(courseTitleIndices[i], courseTitleIndices[i+1]));
		}

        console.log(courseBlocks);
	}
}

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
		callback(null, scraper.departmentValues(body));
	},
	function (values, callback) {
		async.each(values, function (item, callback) {
			var formdata = cfg.formdata;
			formdata.Dept = item;
			
			request.post({url: cfg.url, form: formdata}, function(error, response, body) {
				scraper.department(body);
				callback(null);
			});
		}, function (err) {
			callback(err);
		});
	},
], function (err, result) {
});
