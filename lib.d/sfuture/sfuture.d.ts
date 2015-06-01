/// <reference path="../mpromise/mpromise.d.ts" />

declare module "sfuture" {
  import Promise = require('mpromise');

  interface IFutureFunction<T> {
    (): T;
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
  class Future<T> {
    constructor(promise: Promise<T>);
    static sequence(...futures: Future<any>[]): Future<any[]>;
    static successful<T>(result: T): Future<T>;
    static failed<T>(err: Error): Future<T>;
    static create<T>(fn: IFutureFunction<T>): Future<T>;
    static denodify<T>(fn: Function, thisArg: any, ...args: any[]): Future<T>;

    onComplete(callback: IFutureCallback<T>): Future<T>;
    onSuccess(callback: IFutureSuccessCallback<T>): Future<T>;
    onFailure(callback: IFutureFailureCallback): Future<T>;
    map<U>(mapping: (org: T) => U): Future<U>;
    flatMap<U>(futuredMapping: (org: T) => Future<U>): Future<U>;
    filter(filterFunction: (value: T) => boolean): Future<T>;
    recover(recoverFunction: (err: Error) => T): Future<T>;
    transform<U>(transformFunction: (err: Error, result: T) => (U|Error)): Future<U>;
    andThen(callback: IFutureCallback<T>): Future<T>;
    nodify(callback: (err: Error, result: T) => void): void;
  }

  export = Future;
}
