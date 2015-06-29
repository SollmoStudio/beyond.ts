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

    static failed<T>(err: Error): Future<T>;
    static successful<T>(result: T): Future<T>;
    static fromTry<T>(err: Error, result: T): Future<T>;

    static apply<T>(fn: IFutureFunction<T>): Future<T>;

    static sequence<T>(futures: Future<T>[]): Future<T[]>;
    static firstCompletedOf<T>(futures: Future<T>[]): Future<T>;

    static find<T>(futures: Future<T>[], predicate: (value: T) => boolean): Future<T>;
    static fold<T, R>(futures: Future<T>[], base: R, op: (base: R, result: T) => R): Future<R>;
    static reduce<T>(futures: Future<T>[], op: (base: T, result: T) => T): Future<T>;
    static traverse<T, R>(args: T[], fn: (arg: T) => Future<R>): Future<R[]>;

    static denodify<T>(fn: Function, thisArg: any, ...args: any[]): Future<T>;

    onSuccess(callback: IFutureSuccessCallback<T>): Future<T>;
    onFailure(callback: IFutureFailureCallback): Future<T>;
    onComplete(callback: IFutureCallback<T>): Future<T>;

    foreach<U>(f: (result: T) => U): void;
    transform<U>(s: (value: T) => (U), f: (err: Error) => Error): Future<U>;

    map<U>(mapping: (org: T) => U): Future<U>;
    flatMap<U>(futuredMapping: (org: T) => Future<U>): Future<U>;

    filter(filterFunction: (value: T) => boolean): Future<T>;
    withFilter(filterFunction: (value: T) => boolean): Future<T>;

    collect<S>(pf: (value: T) => S): Future<S>;

    recover(recoverFunction: (err: Error) => T): Future<T>;
    recoverWith(recoverFunction: (err: Error) => Future<T>): Future<T>;

    zip<U>(future: Future<U>): Future<any[]>;

    fallbackTo(future: Future<T>): Future<T>;

    andThen(callback: IFutureCallback<T>): Future<T>;

    nodify(callback: (err: Error, result: T) => void): void;
  }

  export = Future;
}
