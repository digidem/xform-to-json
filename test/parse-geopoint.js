'use strict';

require('chai').should();

var parseGeopoint = require('../lib/parse-geopoint.js');
var _ = require('lodash');

describe('parse-geopoint', function () {
  var geopoints = {
    '0.0 0.0 0.0 0.0': {
      latitude: 0.0,
      longitude: 0.0,
      altitude: 0.0,
      precision: 0.0
    },
    '-90 -180 1000 5': '-90 -180 1000 5',
    '-90.0 -180.0 1000.0 5.0': {
      latitude: -90.0,
      longitude: -180.0,
      altitude: 1000.0,
      precision: 5.0
    },
    '90.0 180.0 1000.0 5.0': {
      latitude: 90.0,
      longitude: 180.0,
      altitude: 1000.0,
      precision: 5.0
    },
    '45.12345 -45.12345 1000.12345 5.12345': {
      latitude: 45.12345,
      longitude: -45.12345,
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
