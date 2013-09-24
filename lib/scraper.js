module.exports = function Scraper(cheerio, cfg, parser) {
    this.cheerio = cheerio;
    this.debug = debug;

    this.departmentValues = function(body) {
        // Get the values for the departments that we want
        $ = this.cheerio.load(body);
        var values = $('select[name="Dept"] > option[style!="color: gray"]').map(function () {
            return $(this).val()
        });

        values.shift(); // Remove the 'ALL' option

        return values;
    };

    this.department = function(shortname, body) {
        console.log("Parsing " + shortname);
        $ = this.cheerio.load(body);
        var table = $(".course-list > table");

        var collegeTitle = table.find('.college-title').first().text().trim();
        var collegeComment = table.find('.college-comment').text().trim();

        var deptTitleElement = table.find('.dept-title').first();
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
        if (trs.is('tbody')) {
            trs = trs.children();
        }

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
            // First, generate each offset. Stuff may be out of order (such as with the Nor column) :(
            columnDefinitions = element.closest('tr[bgcolor="#E7E7E7"]').children();
            columnDefinitions.each(function (index, element) {
                var def = $(this).text().trim().toLowerCase();

                if (!cfg.sectionOffsets.hasOwnProperty(def)) throw "No such column " + def;

                cfg.sectionOffsets[def] = index;
            });

            // First line: We want the course number and course name
            // Also save the pre-requisites URL
            var courseTitle = element.first().find('td > font > b').text().trim();
            var line = element.first().html().trim();
            var regex = /\d+\S*(?=\s&nbsp;\s&nbsp;)/;
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
                    times = null;
                } else {
                    var times = extractLines(multipleRegex, timeText);

                    times.forEach(function (element, index, array) {
                        var days = daysRegex.exec(element)[0];
                        days = parser.parseClassDaysString(days);

                        var time = parser.parseTimeRange(timeStartRegex.exec(element)[0], timeEndRegex.exec(element)[0]);

                        array[index] = {
                            days: days,
                            timeStart: time.timeStart,
                            timeEnd: time.timeEnd,
                            place: null
                        };
                    });
                }

                var placeRegex = /\d[A-Z|a-z]/;
                var placeElement = e.eq(cfg.sectionOffsets.place);
                var placeText = placeElement.text().trim();
                if (!(placeText == 'TBA' || !placeText || !times)) {
                    var places = extractLines(placeRegex, placeText);
                    times.forEach(function (element, index, array) {
                        array[index]['place'] = places[index];
                    });
                }

                var finalDayRegex = /\w+ \d+(?=,)/;
                var finalTimeStartRegex = /\d+:(\d+){2}(?=-)/;
                var finalTimeEndRegex = /\d{1,2}:\d{1,2}($|pm|am)/;
                var coursefinal = e.eq(cfg.sectionOffsets.final).text().trim();
                if (coursefinal == 'TBA' || coursefinal.length == 0) {
                    coursefinal = null;
                } else {
                    var time = parser.parseTimeRange(finalTimeStartRegex.exec(coursefinal)[0], finalTimeEndRegex.exec(coursefinal)[0]);
                    coursefinal = {
                        day: finalDayRegex.exec(coursefinal)[0],
                        timeStart: time.timeStart,
                        timeEnd: time.timeEnd
                    };
                }

                var enrolledRegex = /\d+/g;
                var enrolled = e.eq(cfg.sectionOffsets.enr).text().trim();
                var numbers = enrolled.match(enrolledRegex);
                if (numbers.length == 0) {
                    enrolled = 0;
                } else if (numbers.length > 1) {
                    enrolled = numbers[numbers.length - 1];
                }

                var instructorsHtml = e.eq(cfg.sectionOffsets.instructor).html().trim();
                var instructors = instructorsHtml.split(/<.*>/);
                instructors = instructors.map(function (element) {
                    return element.trim();
                });

                instructors.forEach(function(element, index, array) {
                    if ((element == '&nbsp;') || (element == '')) {
                        array = array.splice(index, 1);
                    }
                });

                var section = {
                    code: e.eq(cfg.sectionOffsets.code).text().trim(),
                    type: parser.parseType(e.eq(cfg.sectionOffsets.type).text().trim()),
                    section: e.eq(cfg.sectionOffsets.sec).text().trim(),
                    units: e.eq(cfg.sectionOffsets.units).text().trim(),
                    instructor: instructors,
                    times: times,
                    coursefinal: coursefinal,
                    max: e.eq(cfg.sectionOffsets.max).text().trim(),
                    enrolled: enrolled,
                    //waitlisted: e.eq(cfg.sectionOffsets.wl).text().trim(),
                    req: e.eq(cfg.sectionOffsets.req).text().trim(),
                    restrictions: e.eq(cfg.sectionOffsets.rstr).text().trim(),
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
