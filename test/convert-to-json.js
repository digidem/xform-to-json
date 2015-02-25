'use strict';

require('chai').should();

var xmlToJson = require('../');
var fs = require('fs');
var path = require('path');
var assertIsGeojson = require('geojson-assert');

describe('convert-to-json', function (done) {
  var xml = fs.readFileSync(path.resolve(__dirname, 'simple-geo-point.xml'));
  var expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'simple-geo-point.json')));
  var json;

  before(function(done) {
    xmlToJson(xml, function(err, data) {
      if (err) return done(err);
      json = data;
      done();
    });
  });

  it('should parse form to standard json if no options passed', function () {
    json.should.deep.equal(expected);
  });
});
