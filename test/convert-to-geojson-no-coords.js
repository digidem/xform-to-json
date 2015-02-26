'use strict';

require('chai').should();

var xmlToJson = require('../');
var fs = require('fs');
var path = require('path');
var assertIsGeojson = require('geojson-assert');

describe('convert-to-geojson-no-coords', function (done) {
  var xml = fs.readFileSync(path.resolve(__dirname, 'fixtures/simple-no-geo.xml'));
  var expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'fixtures/simple-no-geo.geojson')));
  var json;

  before(function(done) {
    xmlToJson(xml, { geojson: true }, function(err, data) {
      if (err) return done(err);
      json = data;
      done();
    });
  });

  it('should parse form with no location to geojson will geometry = null', function () {
    json.should.deep.equal(expected);
  });

  it('should be valid geojson', function() {
    assertIsGeojson(json);
  });
});
