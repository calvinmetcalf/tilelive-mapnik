var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var assert = module.exports = exports = require('assert');

var overwrite = false;

assert.imageEqualsFile = function(buffer, file_b, callback) {
    if (overwrite) {
        var err = fs.writeFileSync(file_b, buffer);
        if (err) throw err;
        callback(null);
    }
    if (!callback) callback = function(err) { if (err) throw err; };
    file_b = path.resolve(file_b);
    var file_a = '/tmp/' + (Math.random() * 1e16 + path.extname(file_b));
    var diff = file_a + '-diff.png';
    var err = fs.writeFileSync(file_a, buffer);
    if (err) throw err;

    exec('compare -metric PSNR "' + file_a + '" "' +
            file_b + '" "' + diff + '"', function(err, stdout, stderr) {
        if (err) {
            fs.unlinkSync(file_a);
            callback(err);
        } else {
            stderr = stderr.trim();
            if (stderr === 'inf') {
                fs.unlinkSync(file_a);
                callback(null);
            } else {
                var similarity = parseFloat(stderr);
                var err = new Error('Images not equal(' + similarity + '):\n\t' +
                        file_a  + '\n\t' + file_b + '\n\t' + diff);
                err.similarity = similarity;
                callback(err);
            }
        }
    });
};
