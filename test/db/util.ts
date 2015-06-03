import Future = require('sfuture');
import db = require('../../lib/db');

export function connect(): Future<void> {
  return db.initialize('mongodb://localhost:27017/beyondTest');
}

export function close(forceClose: boolean): Future<void> {
  return db.close(forceClose);
}
