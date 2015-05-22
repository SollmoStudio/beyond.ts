import async = require('async');

interface IFutureFunction<T> {
  (cb: IFutureCallback<T>): void;
}

interface IFutureCallback<T> {
  (err?: Error, result?: T): void;
}

interface IFutureSuccessCallback<T> {
  (result: T): void;
}

interface IFutureFailureCallback {
  (err: Error): void;
}

interface IFutureCompleteCallback<T> {
  (result: Error | T, isSuccess: boolean): void;
}

class Future<T> {
  private fn: IFutureFunction<T>;
  private completeCallback: IFutureCompleteCallback<T>;
  private successCallback: IFutureSuccessCallback<T>;
  private failureCallback: IFutureFailureCallback;

  constructor(fn: IFutureFunction<T>) {
    this.fn = fn;
  }

  static sequence(...futures: Future<any>[]): Future<any[]> {
    return new Future(function (cb: IFutureCallback<any[]>) {
      async.parallel(
        futures.map((future: Future<any>) => {
          return (asyncCallback) => {
            future
              .onSuccess((result) => {
                asyncCallback(null, result);
              })
              .onFailure(asyncCallback)
              .end();
          };
        })
      , cb);
    });
  }

  static successful<T>(result: T): Future<T> {
    return new Future((callback) => {
      setTimeout(() => callback(null, result), 0);
    });
  }

  onComplete(callback: IFutureCompleteCallback<T>) {
    this.completeCallback = callback;
    return this;
  }

  onSuccess(callback: IFutureSuccessCallback<T>) {
    this.successCallback = callback;
    return this;
  }

  onFailure(callback: IFutureFailureCallback) {
    this.failureCallback = callback;
    return this;
  }

  map<U>(mapping: (org: T) => U): Future<U> {
    let future = new Future<U>((cb: IFutureCallback<U>) => {
      this.fn(function (err, result) {
        if (err) {
          cb(err);
        } else {
          cb(null, mapping(result));
        }
      });
    });
    return future;
  }

  flatMap<U>(futuredMapping: (org: T) => Future<U>): Future<U> {
    let future = new Future<U>((cb: IFutureCallback<U>) => {
      this.fn(function (err, result) {
        if (err) {
          cb(err);
        } else {
          futuredMapping(result)
            .onSuccess(function (data: U) {
              cb(null, data);
            })
            .onFailure(cb)
            .end();
        }
      });
    });
    return future;
  }

  end() {
    this.fn((err, result) => {
      if (err) {
        if (this.failureCallback) {
          this.failureCallback(err);
        }
        if (this.completeCallback) {
          this.completeCallback(err, false);
        }
      } else {
        if (this.successCallback) {
          this.successCallback(result);
        }
        if (this.completeCallback) {
          this.completeCallback(result, true);
        }
      }
    });
    return this;
  }
}

export = Future;
