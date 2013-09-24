var assert = require('assert');
var parser = require('./../lib/parser');
var fs = require('fs');

suite('parser', function() {
    suite('parseClassDaysString', function(){
        test('Given input from a scraper, convert WebSOC days to their integer equivalents', function() {
            assert.deepEqual(parser.parseClassDaysString('MTuWThF'), [1,2,3,4,5]);
            assert.deepEqual(parser.parseClassDaysString('SuSa'), [0,6]);
            assert.deepEqual(parser.parseClassDaysString('FWTuSaM'), [5,3,2,6,1]);
        });
    });

    suite('parseType', function() {
        test('Given input from a scraper, convert the section type to the full name', function() {
            assert.equal(parser.parseType('act'), 'Activity');
        });
    });

    suite('parseTimeRange', function() {
        test('Should parse times where p|pm signify if it is in the evening', function() {
            assert.deepEqual(parser.parseTimeRange('11:00','12:20pm'), {
                timeStart: 1100,
                timeEnd: 1220
            });

            assert.deepEqual(parser.parseTimeRange('6:00','9:00p'), {
                timeStart: 1800,
                timeEnd: 2100 
            });

            assert.deepEqual(parser.parseTimeRange('10:00','10:50'), {
                timeStart: 1000, 
                timeEnd: 1050 
            });

            assert.deepEqual(parser.parseTimeRange('1:00','3:50pm'), {
                timeStart: 1300, 
                timeEnd: 1550 
            });

            assert.deepEqual(parser.parseTimeRange('5:00', '5:15'), {
                timeStart: 500,
                timeEnd: 515
            });
        });
    });
});
