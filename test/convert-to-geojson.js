'use strict';

require('chai').should();

var xmlToJson = require('../');
var fs = require('fs');
var path = require('path');
var assertIsGeojson = require('geojson-assert');

describe('convert-to-geojson', function (done) {
  var xml = fs.readFileSync(path.resolve(__dirname, 'simple-geo-point.xml'));
  var expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'simple-geo-point.geojson')));
  var json;

  before(function(done) {
    xmlToJson(xml, { geojson: true }, function(err, data) {
      if (err) return done(err);
      json = data;
      done();
    });
  });

  it('should parse form with location to geojson if options.geojson = true', function () {
    json.should.deep.equal(expected);
  });

  it('should be valid geojson', function() {
    assertIsGeojson(json);
  });
});
