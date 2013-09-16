module.exports.requestMain = function (request, url, callback) {
    // Request the main WebSOC page and pass the body
    request(url, function (error, response, body) {
        if (error) throw error;

        if (response.statusCode != 200) throw new Error('Non-200 response returned from ' + response.request.href );

        callback(null, body);
    });
}

module.exports.requestDepartment = function (request, url, formdata, callback) {
    // Request courses
    request.post({
        url: url,
    form: formdata
    }, function (error, response, body) {
        callback(null, body);
    });
}
