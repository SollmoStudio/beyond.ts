import assert = require('assert');
import Response = require("../../core/http/response");

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

    it('should return the JSON body of a Response obj.', function () {
      let body: IResponse = {'hello': 'world!'};
      let res = new Response(body);
      assert.deepEqual(res.body, body);
    });
  });

  describe('#contentType', function () {
    it('should return the content type of a Response obj.', function () {
      let res = new Response('hello', 'image/jpeg');
      assert.equal(res.contentType, 'image/jpeg');
    });

    it('should set the Content-Type header of a Response obj.', function () {
      let res = new Response('hello', 'image/jpeg');
      assert.equal(res.headers['Content-Type'], 'image/jpeg');
    });
  });

  describe('#statusCode', function () {
    it('should return the status code of a Response obj.', function () {
      let res = new Response('hello', 'image/jpeg', 301);
      assert.equal(res.statusCode, 301);
    });
  });

  describe('#headers', function () {
    it('can be set by setHeaders() method.', function () {
      let res = new Response('hello');
      res.setHeaders({'Hello-Field': 'world'});
      assert.equal(res.headers['Hello-Field'], 'world');
    });

    it('can be extended by setHeaders() method.', function () {
      let res = new Response('hello');
      res.setHeaders({'Hello-Field': 'world'});
      res.setHeaders({'Hello-Field': 'world2', 'Company-Field': '100'});
      assert.equal(res.headers['Hello-Field'], 'world2');
      assert.equal(res.headers['Company-Field'], '100');
    });
  });
});
