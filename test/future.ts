import assert = require('assert');
import Future = require('../lib/future');

describe('Future', function () {
  describe('constructor', function () {
    it('returns a Future object with a callback', function () {
      let future = new Future(function (callback) {
        setTimeout(callback, 0);
      });
      assert.equal(future.constructor, Future);
    });
  });

  describe('#onComplete', function () {
    it('registers a success callback.', function (done) {
      let future = Future.successful(10);
      future.onComplete(function (result, isSuccess) {
        assert.equal(result, 10);
        assert.equal(isSuccess, true);
        done();
      });
      future.end();
    });

    it('registers a failure callback.', function (done) {
      let future = new Future(function (callback) {
        setTimeout(callback.bind(null, new Error('hello, error!'), 0));
      });
      future.onComplete(function (err: Error, isSuccess) {
        assert.equal(err.message, 'hello, error!');
        assert.equal(isSuccess, false);
        done();
      });
      future.end();
    });
  });

  describe('#onSuccess', function () {
    it('registers a success callback.', function (done) {
      let future = Future.successful(10);
      future.onSuccess(function (result) {
        assert.equal(result, 10);
        done();
      });
      future.end();
    });
  });

  describe('#onFailure', function () {
    it('registers a failure callback.', function (done) {
      let future = new Future(function (callback) {
        setTimeout(callback.bind(null, new Error('hello, error!'), 0));
      });
      future.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      });
      future.end();
    });
  });

  describe('#map', function () {
    it('maps the result of a Future into another result.', function (done) {
      let future = Future.successful(10);
      let mapedFuture = future.map(function (result: number) {
        return result + ' times!';
      });
      mapedFuture.onSuccess(function (result: string) {
        assert.equal(result, '10 times!');
        done();
      });
      mapedFuture.end();
    });

    it('throws error when the original future throws error.', function (done) {
      let future = new Future(function (callback) {
        setTimeout(callback.bind(null, new Error('hello, error!')), 0);
      });
      let mapedFuture = future.map(function (result: number) {
        return result + ' times!';
      });
      mapedFuture.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      });
      mapedFuture.end();
    });
  });

  describe('#flatMap', function () {
    it('maps the result of a Future into another futured result.', function (done) {
      let future = Future.successful(10);
      let flatMappedFuture = future.flatMap(function (result: number) {
        let future = Future.successful(result + ' times!');
        return future;
      });
      flatMappedFuture.onSuccess(function (result: string) {
        assert.equal(result, '10 times!');
        done();
      });
      flatMappedFuture.end();
    });

    it('throws error when the original future throws error.', function (done) {
      let future = new Future(function (callback) {
        setTimeout(callback.bind(null, new Error('hello, error!')), 0);
      });
      let flatMappedFuture = future.flatMap(function (result: number) {
        let future = Future.successful(result + ' times!');
        return future;
      });
      flatMappedFuture.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      });
      flatMappedFuture.end();
    });

    it('throws error when a mapped future throws error.', function (done) {
      let future = Future.successful(10);
      let flatMappedFuture = future.flatMap(function (result: number) {
        let future = new Future(function (callback) {
          setTimeout(callback.bind(null, new Error('hello, error!')), 0);
        });
        return future;
      });
      flatMappedFuture.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      });
      flatMappedFuture.end();
    });
  });

  describe('#sequence', function () {
    it('collects futures and returns a new future of their results.', function (done) {
      let future = Future.sequence(
        Future.successful(10),
        Future.successful('hello'),
        Future.successful(20)
      );
      future.onSuccess(function (results) {
        assert.equal(results[0], 10);
        assert.equal(results[1], 'hello');
        assert.equal(results[2], 20);
        done();
      });
      future.end();
    });

    it('throws an error when any of futures has failed.', function (done) {
      let future = Future.sequence(
        new Future(function (callback) {
          setTimeout(callback.bind(null, new Error('hello, error!')), 0);
        }),
        Future.successful(10),
        Future.successful('hello')
      );
      future.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      });
      future.end();
    });
  });

  describe('#successful', function () {
    it('creates an already completed successful future with the specified result.', function (done) {
      let future = Future.successful('hello');
      future.onSuccess(function (result: string) {
        assert.equal(result, 'hello');
        done();
      });
      future.end();
    });
  });
});
