module.exports = {
    parseClassDaysString: function (days) {
        var regex = /[A-Z][a-z]{0,1}/g;
        var info = days.match(regex);
        var days = [];
        info.forEach(function(element, index, array) {
            switch (element) {
                case 'M':
                    days.push(1);
                    break;
                case 'Tu':
                    days.push(2);
                    break;
                case 'W':
                    days.push(3);
                    break;
                case 'Th':
                    days.push(4);
                    break;
                case 'F':
                    days.push(5);
                    break;
                case 'Sa':
                    days.push(6);
                    break;
                case 'Su':
                    days.push(0);
                    break;
            }
        });

        return days;
    },

    parseType: function (type) {
        type = type.toLowerCase();
        var map = {
            'act': 'Activity',
            'dis': 'Discussion',
            'lab': 'Laboratory',
            'qiz': 'Quiz',
            'sem': 'Seminar',
            'tap': 'Tutorial Assistance Program',
            'col': 'Colloquium',
            'fld': 'Field Work',
            'lec': 'Lecture',
            'res': 'Research',
            'stu': 'Studio',
            'tut': 'Tutorial'
        };

        return map[type];
    },

    // timeEnd should include the 'pm'
    parseTimeRange: function (timeStart, timeEnd) {
        var pmRegex = /(p|pm)$/;
        var isPm = pmRegex.test(timeEnd);
        var timeRegex = /\d{1,2}:\d{1,2}/;
        var timeEnd = timeEnd.match(timeRegex)[0];

        var replaceRegex = /(:|pm|p)/g;
        timeStart = timeStart.replace(replaceRegex, '');
        timeEnd = timeEnd.replace(replaceRegex, '');

        timeStart = parseInt(timeStart, 10);
        timeEnd = parseInt(timeEnd, 10);

        // If PM, assume that timeStart is AM
        if (isPm) {
            var difference = timeStart - timeEnd;
            var timeEndIsSmall = timeEnd < 1200;
            if (timeEndIsSmall) {
                if (difference <= 300) {
                    timeStart += 1200;
                }

                timeEnd += 1200;
            }
        }

        return {
            timeStart: timeStart,
            timeEnd: timeEnd
        };
    }
}
