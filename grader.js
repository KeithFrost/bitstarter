#!/usr/bin/env node
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var util = require('util');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var getStr = function(x) { 
    return x.toString();
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtml = function(html, checksfile) {
    $ = cheerio.load(html);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
}

var checkHtmlFile = function(htmlfile, checksfile, callback) {
    if (htmlfile.substring(0,7) != 'http://') {
        callback(checkHtml(fs.readFileSync(htmlfile), checksfile));
    } else {
        var handler = function(result, response) {
            if (result instanceof Error) {
                console.error('Error: ' + util.format(result.message));
            } else {
                callback(checkHtml(result, checksfile));
            }
        }
        rest.get(htmlfile).on('complete', handler);
    }
}

if (require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', getStr, CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to html file', getStr, HTMLFILE_DEFAULT)
	.parse(process.argv);
    checkHtmlFile(program.file, program.checks, 
                  function(checkJson) {
                      var outJson = JSON.stringify(checkJson, null, 4);
                      console.log(outJson);
                  });
    
} else {
    exports.checkHtmlFile = checkHtmlFile;
}




