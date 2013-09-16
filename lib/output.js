module.exports = {
    toFile: function (filename, departments) {
        var fs = require('fs');

        fs.writeFile(filename, departments, function (err) {
            if (err) throw err;

            console.log('Saved!');
        });
    },

    toDB: function (connection) {
    }
}

