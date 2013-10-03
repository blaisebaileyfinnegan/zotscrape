module.exports = {
    toFile: function (filename, departments) {
        var fs = require('fs');

        fs.writeFile(filename, departments, function (err) {
            if (err) throw err;

            console.log('Saved!');
        });
    },

    /**
     * Weird columns:
     * waitlisted (N/A)
     * enrolled (section / combined)
     * units (range)
     *
     */
    toDB: function (connection, async, results, next) {
        var convertMilitaryTime = function (time) {
            time = time.toString();
            var length = time.length;
            var hours = time.slice(0, length - 2);
            var minutes = time.slice(length - 2);

            time = hours + ':' + minutes + ':00';

            return time;
        }

        var unpackDays = function (days) {
            return days.map(function (element) {
                switch (element) {
                    case 0:
                        return 'sunday';
                    case 1:
                        return 'monday';
                    case 2:
                        return 'tuesday';
                    case 3:
                        return 'wednesday';
                    case 4:
                        return 'thursday';
                    case 5:
                        return 'friday';
                    case 6:
                        return 'saturday';
                }
            });
        }

        var onComplete = function (callback) {
            return function (err) {
                if (err) throw err;

                callback(null);
            }
        }

        // LAST_INSERT_ID() is done to force an insertId on result

        var saveQuarters = function (item, callback) {
            var info = {
                quarter: item.quarter.quarter,
                year_term: item.quarter.yearTerm
            }

            connection.query('INSERT INTO quarters SET ? ON DUPLICATE KEY UPDATE quarter=quarter', [info], function(err) {
                if (err) throw err;

                async.eachSeries(item.departments, saveDepartment(item.quarter.quarter), onComplete(callback));
            });
        }

        var saveMeeting = function (sectionId) {
            return function (item, callback) {
                if (!item) {
                    callback(null);
                    return;
                }

                var info = {
                    section_id: sectionId,
                    start: convertMilitaryTime(item.timeStart),
                    end: convertMilitaryTime(item.timeEnd),
                    place: item.place
                }

                var days = unpackDays(item.days);
                if (days) {
                    days.forEach(function(element) {
                        info[element] = true;
                    });
                }

                connection.query('INSERT INTO meetings SET ? ON DUPLICATE KEY UPDATE ? , meeting_id = LAST_INSERT_ID(meeting_id)',
                        [info, info],
                        onComplete(callback));
            }
        }

        var saveFinal = function (sectionId, coursefinal, callback) {
            var info = {
                section_id: sectionId,
                day: coursefinal.day,
                start: convertMilitaryTime(coursefinal.timeStart),
                end: convertMilitaryTime(coursefinal.timeEnd)
            }

            connection.query('INSERT INTO finals SET ? ON DUPLICATE KEY UPDATE ? , final_id = LAST_INSERT_ID(final_id)',
                    [info, info],
                    onComplete(callback));
        }

        var linkInstructorAndSection = function(sectionId, callback) {
            return function (err, result) {
                var info = {
                    section_id: sectionId,
                    instructor_id: result.insertId
                }
                connection.query('INSERT INTO sections2instructors SET ? ON DUPLICATE KEY UPDATE s2i_id = s2i_id',
                        [info],
                        onComplete(callback));
            }
        }

        var saveInstructor = function (sectionId) {
            return function (item, callback) {
                var info = {
                    name: item
                }

                connection.query('INSERT INTO instructors SET ? ON DUPLICATE KEY UPDATE ? , instructor_id = LAST_INSERT_ID(instructor_id)',
                        [info, info],
                        linkInstructorAndSection(sectionId, callback));
            }
        }

        var saveMeetingsFinalAndInstructors = function (meetings, coursefinal, instructors, callback) {
            return function (err, result) {
                if (err) throw err;
                
                // Either meetings or coursefinal may be null
                async.series([
                    function (next) {
                        if (meetings) {
                            async.eachSeries(meetings, saveMeeting(result.insertId), onComplete(next));
                        } else {
                            next(null);
                        }
                    },
                    function (next) {
                        if (coursefinal) {
                            saveFinal(result.insertId, coursefinal, next);
                        } else {
                            next(null);
                        }
                    },
                    function (next) {
                        if (instructors) {
                            async.eachSeries(instructors, saveInstructor(result.insertId), onComplete(next));
                        } else {
                            next(null);
                        }
                    }
                ],
                onComplete(callback));
            }
        }

        var saveSection = function (courseId) {
            return function (item, callback) {
                var info = {
                    course_id: courseId,
                    ccode: item.code,
                    type: item.type,
                    section: item.section,
                    units: item.units,
                    max: item.max,
                    enrolled: item.enrolled,
                    req: item.req,
                    restrictions: item.restrictions,
                    textbooks: item.textbooks,
                    web: item.web,
                    status: item.status.toLowerCase(),
                }

                connection.query('INSERT INTO sections SET ? ON DUPLICATE KEY UPDATE ? , section_id = LAST_INSERT_ID(section_id)',
                        [info, info],
                        saveMeetingsFinalAndInstructors(item.times, item.coursefinal, item.instructor, callback));

            }
        }


        var saveRelationshipAndSections = function (deptId, sections, callback) {
            return function (err, result) {
                if (err) throw err;

                var courseId = result.insertId;
                var info = {
                    dept_id: deptId,
                    course_id: courseId
                };

                async.series([
                    function (callback) {
                        connection.query('INSERT INTO departments2courses SET ? ON DUPLICATE KEY UPDATE course_id = course_id', [info], onComplete(callback));
                    },
                    function (callback) {
                        if (sections) {
                            async.eachSeries(sections, saveSection(courseId), onComplete(callback));
                        } else {
                            callback(null);
                        }
                    }
                ], function(err) {
                    callback(null);
                });
            }
        }

        var saveCourse = function(deptId, deptShortName) {
            return function (item, callback) {
                var info = {
                    short_name: deptShortName,
                    number: item.number.toUpperCase(),
                    title: item.title.toUpperCase()
                }

                connection.query('INSERT INTO courses SET ? ON DUPLICATE KEY UPDATE ? , course_id = LAST_INSERT_ID(course_id)',
                        [info, info],
                        saveRelationshipAndSections(deptId, item.sections, callback));
            }
        }

        var saveCourses = function (courses, deptShortName, callback) {
            return function (err, result) {
                if (err) throw err;

                if (courses) {
                    async.eachSeries(courses, saveCourse(result.insertId, deptShortName), onComplete(callback));
                } else {
                    callback(null);
                }
            }
        }

        var saveDepartment = function (quarter) {
            return function (item, callback) {
                var info = {
                    quarter: quarter.toUpperCase(),
                    short_name: item.deptShortName.toUpperCase(),
                    college_title: item.collegeTitle,
                    college_comment: item.collegeComment,
                    dept_title: item.deptTitle,
                    dept_comment: item.deptComment
                }

                connection.query('INSERT INTO departments SET ? ON DUPLICATE KEY UPDATE ? , dept_id = LAST_INSERT_ID(dept_id)',
                        [info, info],
                        saveCourses(item.courses, info.short_name, callback));
                console.log('Saving ' + info.short_name);
            }
        }

        async.eachSeries(results, saveQuarters, function (err) {
            if (err) throw err;

            next();
        });
    }
}

