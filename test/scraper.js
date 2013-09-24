var cheerio = require('cheerio');
var cfg = require('./../cfg/cfg');
var assert = require('assert');
var Scraper = require('./../lib/scraper');
var parser = require('./../lib/parser');
var fs = require('fs');

suite('Scraper', function() {
    var scraper;

    setup(function() {
        this.scraper = new Scraper(cheerio, cfg, parser);
    });

    suite('departmentValues', function(){
        test('Should return a list of department shortnames with expired departments omitted', function() {
            html = fs.readFileSync(__dirname + '/static/index.html');
            var departments = this.scraper.departmentValues(html);

            assert.equal(-1, departments.indexOf('ART STU'));
            assert.equal(-1, departments.indexOf('ENVIRON'));
            assert.equal(-1, departments.indexOf('RAD SCI'));
        });
    });

    suite('department', function(){
        test('This should scrape the values correctly from Nursing Science quarters Spring 2013 and Fall 2013', function() {
            var html = fs.readFileSync(__dirname + '/static/nursingF13.html');
            var correct = fs.readFileSync(__dirname + '/static/nursingF13.json', {encoding: 'utf8'});
            correct = JSON.parse(correct);

            var department = this.scraper.department('NUR SCI', html);
            
            assert.equal(JSON.stringify(department), JSON.stringify(correct));
        });
    });
});
