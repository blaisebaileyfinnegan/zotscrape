module.exports = function Scraper(cheerio, cfg, parser, debug) {
    this.cheerio = cheerio;

    this.departmentValues = function(body) {
        // Get the values for the departments that we want
        $ = this.cheerio.load(body);
        var values = $('select[name="Dept"] > option[style!="color: gray"]').map(function () {
            return $(this).val()
        });

        values.shift(); // Remove the 'ALL' option

        if (debug) {
            values = [debug];
        }

        return values;
    };
}
