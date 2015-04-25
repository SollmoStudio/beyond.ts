class Future<T> {
  onSuccess(callback: (result: T) => void) {
    return this;
  }

  onFailure(callback: (err: Error) => void) {
    return this;
  }
}

export = Future;
