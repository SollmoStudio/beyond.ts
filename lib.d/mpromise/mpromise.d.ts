// Type definitions for mpromise 0.5.4
// Project: https://github.com/aheckmann/mpromise
// Copied from mongoose of DefinitelyTyped

declare module "mpromise" {
  class Promise<T> {
    constructor(fn?: (err: any, result: T) => void);

    then<U>(onFulFill: (result: T) => void, onReject?: (err: any) => void): Promise<U>;
    end(): void;

    fulfill(result: T): Promise<T>;
    reject(err: any): Promise<T>;
    resolve(err: any, result: T): Promise<T>;

    onFulfill(listener: (result: T) => void): Promise<T>;
    onReject(listener: (err: any) => void): Promise<T>;
    onResolve(listener: (err: any, result: T) => void): Promise<T>;
    on(event: string, listener: Function): Promise<T>;

    // Deprecated methods.
    addBack(listener: (err: any, result: T) => void): Promise<T>;
    addCallback(listener: (result: T) => void): Promise<T>;
    addErrback(listener: (err: any) => void): Promise<T>;
    complete(result: T): Promise<T>;
    error(err: any): Promise<T>;
  }

  export = Promise;
}
