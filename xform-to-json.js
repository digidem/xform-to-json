'use strict';

var parseGeopoint = require('./lib/parse-geopoint.js');
var traverse = require('traverse');
var uuid = require('uuid');
var xml2js = require('xml2js');
var _ = require('lodash');

var parseXmlString = new xml2js.Parser({
  explicitArray: false
}).parseString;

function coerceProperties(value) {
  var result = value;

  // Properties whose value is null or an empty string are removed from the
  // JSON
  if (value === '' || value === null || value === undefined) {
    this.remove();
  }

  // Normalize true and false to lowercase so that JSON.parse handles
  // converting them
  if (typeof value === 'string' &&
      (value.toLowerCase() === 'true' ||
       value.toLowerCase() === 'false')) {
    value = value.toLowerCase();
  }

  try {
    // This gets integers, floats, and true/false
    result = JSON.parse(value);
  } catch (e) {
    // Parses geopoints and returns an object with the coordinates, altitude
    // and precision
    if (typeof value === 'string') {
      result = parseGeopoint(value);
    }
  }

  if (result !== value) {
    this.update(result);
  }
}

// List of sorted keynames on a location object
// (used for identifying valid location objects)
var locationKeys = Object.keys(parseGeopoint('0 0 0 0')).sort();

// Returns true for a location field
function isLocation(value) {
  if (!(value instanceof Object)) return false;
  var keys = Object.keys(value).sort();
  return _.isEqual(keys, locationKeys);
}

// Setting geojson to true will output geojson if a location field is found
// If locationField is null or undefined, it will abritrarily pick the first
// location field it finds in the form (ODK forms can contain multiple locations)
// You can specify locationField with the name of the field you want to use
// for the geojson coordinates. If geojson is false, locationField is ignored.
var defaults = {
  geojson: false,
  locationField: null
};

// Parses an xform submission from ODK collect into a JSON string, cleaning up
// the data and adding metadata
module.exports = function (data, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }

  options = _.defaults(options, defaults);

  var meta = options.meta || {};

  parseXmlString(data, function (err, json) {
    var form;
    var formKey;
    var geojson = {
      "type": "Feature",
      "geometry": {
        "type": "Point"
      }
    };

    if (err) {
      console.error('error parsing XML string', err);
      return callback(err);
    }

    // ODK Collect sends an object with a single property named from the form.
    // The value of this property is what we are interested in
    _.forOwn(json, function (property, key) {
      form = property;
      formKey = key;
    });

    // Organize form metadata under a single property (deleting any duplicated
    // values)
    form.meta = {
      // XXX: Should this be a hash so that subsequent runs yield the same
      // result?
      instanceId: (form.meta && form.meta.instanceID) || 'uuid:' + uuid.v1(),
      instanceName: (form.meta && form.meta.instanceName) || formKey,
      formId: form.$.id,
      version: form.$.version,
      submissionTime: new Date()
    };

    delete form.$;

    // Add any metadata passed to the function
    _.assign(form.meta, meta);

    // Turn boolean strings, floats, and integers into native objects and turn
    // the geopoint into something more readable
    form = traverse(form).forEach(function(value) {
      coerceProperties.call(this, value);

      if (options.geojson) {
        var isSelectedLocationField = (options.locationField === this.key && isLocation(this.node));
        var isFirstLocationField = (!geojson.geometry.coordinates && isLocation(this.node));
        if (isSelectedLocationField || isFirstLocationField) {
          geojson.geometry.coordinates = [this.node.longitude, this.node.latitude];
        }
      }
    });

    if (options.geojson && geojson.geometry.coordinates) {
      geojson.properties = form;
      form = geojson;
    }

    callback(null, form);
  });
};
