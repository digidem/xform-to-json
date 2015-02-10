'use strict';

require('chai').should();

var parseGeopoint = require('../lib/parse-geopoint.js');
var _ = require('lodash');

describe('parse-geopoint', function () {
  var geopoints = {
    '0 0 0 0': {coordinates: [0, 0], altitude: 0, precision: 0},
    '-90 -180 1000 5': {
      coordinates: [-180.0, -90.0],
      altitude: 1000.0,
      precision: 5.0
    },
    '-90.0 -180.0 1000.0 5.0': {
      coordinates: [-180.0, -90.0],
      altitude: 1000.0,
      precision: 5.0
    },
    '90.0 180.0 1000.0 5.0': {
      coordinates: [180.0, 90.0],
      altitude: 1000.0,
      precision: 5.0
    },
    '45.12345 -45.12345 1000.12345 5.12345': {
      coordinates: [-45.12345, 45.12345],
      altitude: 1000.12345,
      precision: 5.12345
    }
  };

  _.forOwn(geopoints, function (value, key) {
    it('should parse geopoint string "' + key + '"', function () {
      parseGeopoint(key).should.deep.equal(value);
    });
  });
});
