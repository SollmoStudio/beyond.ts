import Future = require('sfuture');
import connection = require('../lib/db/connection');

export function initialize(url: string): Future<void> {
  return connection.initialize(url);
}

export function close(forceClose: boolean): Future<void> {
  return connection.close(forceClose);
}

