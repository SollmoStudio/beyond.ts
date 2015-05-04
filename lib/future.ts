interface FutureFunction<T> {
  (cb: FutureCallback<T>): void;
}

interface FutureCallback<T> {
  (err?: Error, result?: T): void;
}

interface FutureSuccessCallback<T> {
  (result: T): void;
}

interface FutureFailureCallback {
  (err: Error): void;
}

class Future<T> {
  private fn: FutureFunction<T>;
  private successCallback: FutureSuccessCallback<T>;
  private failureCallback: FutureFailureCallback;

  constructor(fn: FutureFunction<T>) {
    this.fn = fn;
  }

  onSuccess(callback: FutureSuccessCallback<T>) {
    this.successCallback = callback;
    return this;
  }

  onFailure(callback: FutureFailureCallback) {
    this.failureCallback = callback;
    return this;
  }

  map<U>(mapping: (org: T) => U): Future<U> {
    let future = new Future<U>((cb: FutureCallback<U>) => {
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
    let future = new Future<U>((cb: FutureCallback<U>) => {
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
      } else {
        if (this.successCallback) {
          this.successCallback(result);
        }
      }
    });
    return this;
  }
}

export = Future;
