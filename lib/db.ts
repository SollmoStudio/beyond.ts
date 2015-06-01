import Future = require('sfuture');
import connection = require('./db/connection');

export const Collection = require('./db/collection');

export const ASC = 1;
export const DESC = -1;

export function initialize(url: string): Future<void> {
  return connection.initialize(url);
}

export function close(forceClose: boolean): Future<void> {
  return connection.close(forceClose);
}
