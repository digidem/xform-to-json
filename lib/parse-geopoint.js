'use strict';

var _ = require('lodash');

// Stricter parsing function, from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat
function isFloat(value) {
  return /^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value);
}

function withinBounds(latitude, longitude) {
  return latitude >= -90 &&
         latitude <= 90 &&
         longitude >= -180 &&
         longitude <= 180;
}

module.exports = function (value) {
  if (typeof value !== 'string') {
    return value;
  }

  var parts = value.split(' ');

  if (parts.length !== 4) {
    return value;
  }

  if (!_.all(parts, isFloat)) {
    return value;
  }

  if (!withinBounds(parts[0], parts[1])) {
    return value;
  }

  parts = parts.map(_.partialRight(parseFloat, 10));

  return {
    coordinates: [parts[1], parts[0]],
    altitude: parts[2],
    precision: parts[3]
  };
};
