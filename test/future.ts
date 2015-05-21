import assert = require('assert');
import Future = require('../lib/future');

describe('Future', function () {
  describe('constructor', function () {
    it('returns a Future object with a callback', function () {
      let future = Future.create(function () {
        return;
      });
      assert.equal(future.constructor, Future);
    });

    it('returns a successful Future object with return value', function (done) {
      let future = Future.create(function () {
        return 10;
      });
      assert.equal(future.constructor, Future);
      future.onSuccess(function (result: number) {
        assert.equal(result, 10);
        done();
      }).onFailure(function (err: Error) {
        assert(false, 'Must not reached here.');
        done();
      });
    });

    it('returns a failed Future object when callback throws error', function (done) {
      let future = Future.create(function () {
        throw new Error('error');
      });
      assert.equal(future.constructor, Future);
      future.onFailure(function (err: Error) {
        assert.equal(err.message, 'error');
        done();
      }).onFailure(function (result) {
        assert(false, 'Must not reached here.');
        done();
      });
    });

    it('creates an already completed successful future with the specified result.', function (done) {
      let future = Future.successful('hello');
      future.onSuccess(function (result: string) {
        assert.equal(result, 'hello');
        done();
      }).onFailure(function (err: Error) {
        assert(false, 'Must not reached here.');
        done();
      });
    });

    it('creates an already completed failed future with the specified result.', function (done) {
      let future = Future.failed(new Error('error'));
      future.onFailure(function (err: Error) {
        assert.equal(err.message, 'error');
        done();
      }).onSuccess(function (result) {
        assert(false, 'Must not reached here.');
        done();
      });
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
    });

    it('registers a failure callback.', function (done) {
      let future = Future.failed(new Error('hello, error!'));
      future.onComplete(function (err: Error, isSuccess) {
        assert.equal(err.message, 'hello, error!');
        assert.equal(isSuccess, false);
        done();
      });
    });
  });

  describe('#onSuccess', function () {
    it('registers a success callback.', function (done) {
      let future = Future.successful(10);
      future.onSuccess(function (result) {
        assert.equal(result, 10);
        done();
      }).onFailure(function (err: Error) {
        assert(false, 'Must not reached here.');
        done();
      });
    });
  });

  describe('#onFailure', function () {
    it('registers a failure callback.', function (done) {
      let future = Future.failed(new Error('hello, error!'));
      future.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      }).onSuccess(function (result) {
        assert(false, 'Must not reached here.');
        done();
      });
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
      }).onFailure(function (err: Error) {
        assert(false, 'Must not reached here.');
        done();
      });
    });

    it('throws error when the original future throws error.', function (done) {
      let future = Future.failed(new Error('hello, error!'));
      let mapedFuture = future.map(function (result: number) {
        return result + ' times!';
      });
      mapedFuture.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      }).onSuccess(function (result) {
        assert(false, 'Must not reached here.');
        done();
      });
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
      }).onFailure(function (err: Error) {
        assert(false, 'Must not reached here.');
        done();
      });
    });

    it('throws error when the original future throws error.', function (done) {
      let future = Future.failed(new Error('hello, error!'));
      let flatMappedFuture = future.flatMap(function (result: number) {
        let future = Future.successful(result + ' times!');
        return future;
      });
      flatMappedFuture.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      }).onSuccess(function (result) {
        assert(false, 'Must not reached here.');
        done();
      });
    });

    it('throws error when a mapped future throws error.', function (done) {
      let future = Future.successful(10);
      let flatMappedFuture = future.flatMap(function (result: number): Future<number> {
        throw new Error('hello, error!');
      });
      flatMappedFuture.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      }).onSuccess(function (result) {
        assert(false, 'Must not reached here.');
        done();
      });
    });
  });

  describe('#filter', function () {
    it('filter returns the same error when it is already failed.', function <T>(done) {
      let future = Future.failed<T>(new Error('hello, error!'));
      let filteredFuture = future.filter(function (result: T): boolean {
        return true;
      });

      filteredFuture.onFailure(function (err: Error) {
        assert.equal(err.message, 'hello, error!');
        done();
      }).onSuccess(function (result: T) {
        assert(false, 'Must not reached here.');
        done();
      });
    });

    it('if filter function returns false, the result is failed future.', function (done) {
      let future = Future.successful(1);
      let filteredFuture = future.filter(function (result: number): boolean {
        return false;
      });

      filteredFuture.onFailure(function (err: Error) {
        done();
      }).onSuccess(function (result: number) {
        assert(false, 'Must not reached here.');
        done();
      });
    });

    it('if filter function returns true, the result is same as origianl future.', function (done) {
      let future = Future.successful(1);
      let filteredFuture = future.filter(function (result: number) {
        return true;
      });

      filteredFuture.onFailure(function (err: Error) {
        assert(false, 'Must not reached here.');
        done();
      }).onSuccess(function (result: number) {
        assert.equal(result, 1);
        done();
      });
    });
  });

  describe('#recover', function () {
    it('recover returns the same result with successful future.', function (done) {
      let future = Future.successful(120);
      let recoveredFuture = future.recover(function (err: Error): number {
        return 100;
      });

      recoveredFuture.onFailure(function (err: Error) {
        assert(false, 'Must not reached here.');
        done();
      }).onSuccess(function (result: number) {
        assert.equal(120, result);
        done();
      });
    });

    it('recover the failed future.', function (done) {
      let future = Future.failed(new Error('Fail'));
      let recoveredFuture = future.recover(function (err: Error): number {
        return 100;
      });

      recoveredFuture.onFailure(function (err: Error) {
        assert(false, 'Must not reached here.');
        done();
      }).onSuccess(function (result: number) {
        assert.equal(100, result);
        done();
      });
    });
  });

  describe('#sequence', function () {
    it('collects futures and returns a new future of their results.', function (done) {
      let future: Future<any[]> = Future.sequence(
        Future.successful(10),
        Future.successful('hello'),
        Future.successful(20)
      );
      future.onSuccess(function (results) {
        assert.equal(results[0], 10);
        assert.equal(results[1], 'hello');
        assert.equal(results[2], 20);
        done();
      }).onFailure(function (err: Error) {
        assert(false, 'Must not reached here.');
        done();
      });
    });

    it('throws an error when any of futures has failed.', function (done) {
      let future: Future<any[]> = Future.sequence(
        Future.failed(new Error('hello, error!')),
        Future.successful(10),
        Future.successful('hello')
      );
      future.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      }).onSuccess(function (result) {
        assert(false, 'Must not reached here.');
        done();
      });
    });
  });
});
