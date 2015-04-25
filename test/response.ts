import assert = require('assert');
import Response = require("../lib/response");

describe('Response', function () {
  describe('#constructor()', function () {
    it('should return a proper Response object.', function () {
      let res = new Response('hello');
      assert.equal(!!res, true);
    });

    it('should return an object with a JSON body.', function () {
      let res = new Response({'hello': 'world'});
      assert.equal(!!res, true);
    });

    it('should return an object with a content type.', function () {
      let res = new Response('hello', 'image/jpeg');
      assert.equal(!!res, true);
    });

    it('should return an object with a content type and status code.', function () {
      let res = new Response('hello', 'image/jpeg', 301);
      assert.equal(!!res, true);
    });
  });

  describe('#body', function () {
    it('should return the body string of a Response obj.', function () {
      let res = new Response('hello');
      assert.equal(res.body, 'hello');
    });

    it('should return the stringified JSON body of a Response obj.', function () {
      let body: IResponse = {'hello': 'world!'};
      let res = new Response(body);
      assert.equal(res.body, JSON.stringify(body));
    });
  });

  describe('#contentType', function () {
    it('should return the content type of a Response obj.', function () {
      let res = new Response('hello', 'image/jpeg');
      assert.equal(res.contentType, 'image/jpeg');
    });
  });

  describe('#statusCode', function () {
    it('should return the status code of a Response obj.', function () {
      let res = new Response('hello', 'image/jpeg', 301);
      assert.equal(res.statusCode, 301);
    });
  });
});
