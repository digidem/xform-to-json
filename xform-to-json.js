'use strict';

var parseGeopoint = require('./lib/parse-geopoint.js');
var traverse = require('traverse');
var uuid = require('uuid');
var xml2js = require('xml2js');
var _ = require('lodash');

var parseXmlString = new xml2js.Parser({
  explicitArray: false
}).parseString;

function updateProperties(value) {
  var result = value;

  // Properties whose value is null or an empty string are removed from the
  // JSON
  if (value === '' || value === null || value === undefined) {
    this.remove();
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

// Parses an xform submission from ODK collect into a JSON string, cleaning up
// the data and adding metadata
module.exports = function (data, meta, callback) {
  meta = meta || {};

  parseXmlString(data, function (err, json) {
    var form;
    var formKey;

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
    form = traverse(form).forEach(updateProperties);

    callback(null, form);
  });
};
