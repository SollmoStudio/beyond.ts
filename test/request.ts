import assert = require('assert');
import bodyParser = require('body-parser');
import express = require('express');
import http = require('http');
import Request = require('../lib/request');
import querystring = require('querystring');

let expressApp = express();
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({extended: false}));
let expressServer = null;
let expressFormRequest: express.Request = null;
let expressJsonRequest: express.Request = null;
let requestBody = {
  'hello' : 'world',
  'beyond': 'framework'
};

describe('Request', function () {
  before(function (done) {
    setExpressRequests(done);
  });

  after(function (done) {
    expressServer.close(done);
  });

  describe('#constructor', function () {
    it('should return a proper Request object with form data.', function () {
      let res = new Request(expressFormRequest);
      assert.equal(!!res, true);
    });

    it('should return a proper Request object with JSON data.', function () {
      let res = new Request(expressJsonRequest);
      assert.equal(!!res, true);
    });
  });

  describe('#bodyAsText', function () {
    it('should return the body as a string with form data.', function () {
      let res = new Request(expressFormRequest);
      assert.equal(typeof res.bodyAsText, 'string');
      assert.equal(res.bodyAsText, querystring.stringify(requestBody));
    });

    it('should return the body as a string with json data.', function () {
      let res = new Request(expressJsonRequest);
      assert.equal(typeof res.bodyAsText, 'string');
      assert.equal(res.bodyAsText, JSON.stringify(requestBody));
    });
  });

  describe('#bodyAsFormUrlEncoded', function () {
    it('should return the body as an object with form data.', function () {
      let res = new Request(expressFormRequest);
      assert.equal(typeof res.bodyAsFormUrlEncoded, 'object');
      assert.deepEqual(res.bodyAsFormUrlEncoded, requestBody);
    });
  });

  describe('#bodyAsJsonString', function () {
    it('should return the body as a string with json data.', function () {
      let res = new Request(expressJsonRequest);
      assert.equal(typeof res.bodyAsJsonString, 'string');
      assert.equal(res.bodyAsJsonString, JSON.stringify(requestBody));
    });
  });

  describe('#bodyAsJson', function () {
    it('should return the body as an object with json data.', function () {
      let res = new Request(expressJsonRequest);
      assert.equal(typeof res.bodyAsJson, 'object');
      assert.deepEqual(res.bodyAsJson, requestBody);
    });
  });

  describe('#method', function () {
    it('should return the method with form data.', function () {
      let res = new Request(expressFormRequest);
      assert.equal(res.method, 'POST');
    });

    it('should return the method with json data.', function () {
      let res = new Request(expressJsonRequest);
      assert.equal(res.method, 'POST');
    });
  });

  describe('#uri', function () {
    it('should return the uri path without the plugin name with form data.', function () {
      let res = new Request(expressFormRequest);
      assert.equal(res.uri, '/plugin/hello');
    });

    it('should return the uri path without the plugin name with json data.', function () {
      let res = new Request(expressJsonRequest);
      assert.equal(res.uri, '/plugin/world');
    });
  });

  describe('#contentType', function () {
    it('should return the content-type with form data.', function () {
      let res = new Request(expressFormRequest);
      assert.equal(res.contentType, 'application/x-www-form-urlencoded');
    });

    it('should return the content-type with json data.', function () {
      let res = new Request(expressJsonRequest);
      assert.equal(res.contentType, 'application/json');
    });
  });

  describe('#secure', function () {
    it('should return whether the request is secure with form data.', function () {
      let res = new Request(expressFormRequest);
      assert.equal(res.secure, false);
    });

    it('should return whether the request is secure with json data.', function () {
      let res = new Request(expressJsonRequest);
      assert.equal(res.secure, false);
    });
  });

  describe('#headers', function () {
    it('should return the headers with form data.', function () {
      let res = new Request(expressFormRequest);
      assert.equal(res.headers['custom-header'], 'this is custom header1');
    });

    it('should return the headers with json data.', function () {
      let res = new Request(expressJsonRequest);
      assert.equal(res.headers['custom-header'], 'this is custom header2');
    });
  });
});

function setExpressRequests(done) {
  expressApp.post('/plugin/form/hello', function (req, res) {
    res.send('hello');
    expressFormRequest = req;
  });
  expressApp.post('/plugin/json/world', function (req, res) {
    res.send('hello');
    expressJsonRequest = req;
    done();
  });
  expressServer = expressApp.listen(8999, function () {
    let formData = querystring.stringify(requestBody);
    let req = http.request({
      agent: false,
      hostname: 'localhost',
      port: 8999,
      path: '/plugin/form/hello',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': formData.length,
        'Custom-Header': 'this is custom header1'
      }
    }, function () {
      let jsonData = JSON.stringify(requestBody);
      let req2 = http.request({
        hostname: 'localhost',
        port: 8999,
        path: '/plugin/json/world',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': jsonData.length,
          'Custom-Header': 'this is custom header2'
        }
      });
      req2.write(jsonData);
      req2.end();
    });
    req.write(formData);
    req.end();
  });
}
