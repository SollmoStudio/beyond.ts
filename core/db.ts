import Future = require('sfuture');
import _ = require('underscore');
import assert = require('assert');
import mongodb = require('mongodb');

let mongoDb: mongodb.Db = undefined;

export function initialize(url: string): Future<void> {
  let mongoClient = mongodb.MongoClient;
  return Future.denodify<mongodb.Db>(mongoClient.connect, mongoClient, url)
  .map((db: mongodb.Db): void => {
    assert.equal(mongoDb, undefined);
    mongoDb = db;
  });
}

export function close(forceClose: boolean): Future<void> {
  if (_.isUndefined(mongoDb)) {
    return Future.successful<void>(null);
  }

  let db = mongoDb;
  mongoDb = undefined;
  return Future.denodify<void>(db.close, db, forceClose);
}

export function connection(): mongodb.Db {
  return mongoDb;
}
