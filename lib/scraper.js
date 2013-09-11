module.exports = function Scraper(cheerio, cfg, debug) {
    this.cheerio = cheerio;
    this.debug = debug;

	this.departmentValues = function(body) {
		// Get the values for the departments that we want
		$ = this.cheerio.load(body);
		var values = $('select[name="Dept"] > option').map(function () {
			return $(this).val()
		});
		
		values.shift() // Remove the 'ALL' option
		if (this.debug) {
			values = [this.debug];
		}
		
		return values;
	},

	this.department = function(shortname, body) {
		$ = this.cheerio.load(body);
		var table = $(".course-list > table");
				
		var collegeTitle = table.find('.college-title').first().text().trim();
		var collegeComment = table.find('.college-comment').text().trim();
				
		var deptTitleElement = table.find('.dept-title');
		var deptTitle = deptTitleElement.text().trim();
		if (deptTitle) {
			var deptComment = deptTitleElement.next().text().trim();
		}

        var department = {
            deptShortName: shortname,
            collegeTitle: collegeTitle,
            collegeComment: collegeComment,
            deptTitle: deptTitle,
            deptComment: deptComment,
            courses: new Array()
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

        courseBlocks.forEach(function (element) {
            // First line: We want the course number and course name
            // Also save the pre-requisites URL
            var courseTitle = element.first().find('td > font > b').text().trim();
            var line = element.first().text().trim();
            var regex = /\S*\d+\S*/;
            var courseNumber = regex.exec(line)[0];

            // Build our course
            var course = {
                title: courseTitle,
                number: courseNumber,
                sections: new Array()
            }

            // Build sections
            element = element.filter('tr[valign="top"]');
            element = element.slice(1);
            course.sections = element.map(function(index, e) {
                e = $(e).children();

                var web = e.eq(cfg.sectionOffsets.web);
                if (web.children().length > 0) {
                    web = web.children().first().attr('href');
                } else {
                    web = "";
                }

                var timeElement = e.eq(cfg.sectionOffsets.time);

                var timeText = timeElement.text().trim();

                var multipleRegex = /(p|\d)[\sMWFTuhSa](?!$)/;
                var daysRegex = /^[MWFTuThSa]+(?=\s)/;
                var timeStartRegex = /\d{1,2}:\d{1,2}(?=-)/;
                var timeEndRegex = /\d{1,2}:\d{1,2}($|p)/;

                var extractLines = function(regex, text) {
                    var lines = [];
                    if (regex.test(text)) {
                        var index;
                        while ((index = text.search(regex)) > -1) {
                            lines.push(text.slice(0, index + 1));
                            text = text.slice(index + 1).trim();
                        }
                    }

                    lines.push(text);
                    
                    return lines;
                }
                
                if (timeText == 'TBA' || !timeText) {
                    times = [ {
                        days: null,
                        timeStart: null,
                        timeEnd: null,
                        place: null
                    } ];
                } else {
                    console.log(timeText);
                    var times = extractLines(multipleRegex, timeText);

                    times.forEach(function (element, index, array) {
                        array[index] = {
                            days: daysRegex.exec(element)[0],
                            timeStart: timeStartRegex.exec(element)[0],
                            timeEnd: timeEndRegex.exec(element)[0],
                            place: null
                        };
                    });
                }

                var placeRegex = /\d[A-Z|a-z]/;
                var placeElement = e.eq(cfg.sectionOffsets.place);
                var placeText = placeElement.text().trim();
                if (!(placeText == 'TBA' || !placeText)) {
                    var places = extractLines(placeRegex, placeText);
                    times.forEach(function (element, index, array) {
                        array[index]['place'] = places[index];
                    });
                }

                var finalDayRegex = /\w+ \d+(?=,)/;
                var finalTimeStartRegex = /\d+:(\d+){2}(?=-)/;
                var finalTimeEndRegex = /\d{1,2}:\d{1,2}($|pm|am)/;
                var coursefinal = e.eq(cfg.sectionOffsets.coursefinal).text().trim();
                if (coursefinal == 'TBA' || coursefinal.length == 0) {
                    coursefinal = null;
                } else {
                    coursefinal = {
                        day: finalDayRegex.exec(coursefinal)[0],
                        timeStart: finalTimeStartRegex.exec(coursefinal)[0],
                        timeEnd: finalTimeEndRegex.exec(coursefinal)[0]
                    };
                }

                var section = {
                    code: e.eq(cfg.sectionOffsets.code).text().trim(),
                    type: e.eq(cfg.sectionOffsets.type).text().trim(),
                    section: e.eq(cfg.sectionOffsets.section).text().trim(),
                    units: e.eq(cfg.sectionOffsets.units).text().trim(),
                    instructor: e.eq(cfg.sectionOffsets.instructor).text().trim(),
                    times: times,
                    coursefinal: coursefinal,
                    max: e.eq(cfg.sectionOffsets.max).text().trim(),
                    enrolled: e.eq(cfg.sectionOffsets.enrolled).text().trim(),
                    waitlisted: e.eq(cfg.sectionOffsets.waitlisted).text().trim(),
                    req: e.eq(cfg.sectionOffsets.req).text().trim(),
                    nor: e.eq(cfg.sectionOffsets.nor).text().trim(),
                    restrictions: e.eq(cfg.sectionOffsets.restrictions).text().trim(),
                    textbooks: e.eq(cfg.sectionOffsets.textbooks).children().first().attr('href'),
                    web: web,
                    status: e.eq(cfg.sectionOffsets.status).text().trim()
                }

                return section;
            });

            department.courses.push(course);
        });

        return department;
	}
}
