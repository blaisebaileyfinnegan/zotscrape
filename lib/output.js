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
    toDB: function (connection) {
    }
}

