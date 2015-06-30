import Future = require('sfuture');
import db = require('../../core/db');


export const TestCollectionName = 'beyondTestCollection';

export function connect(): Future<void> {
  return db.initialize('mongodb://localhost:27017/beyondTest');
}

export function close(forceClose: boolean): Future<void> {
  return db.close(forceClose);
}

export function cleanupCollection(): Future<void> {
  let mongoConnection = db.connection();
  return Future.denodify<void>(mongoConnection.dropCollection, mongoConnection, TestCollectionName)
  .recover(() => {
    return;
  }).flatMap((): Future<void> => {
    return Future.denodify<void>(mongoConnection.createCollection, mongoConnection, TestCollectionName);
  });
}

export function setupData(...docs: any[]): Future<void> {
  let mongoConnection = db.connection();
  let mongoCollection = mongoConnection.collection(TestCollectionName);
  return Future.denodify<void>(mongoCollection.insert, mongoCollection, docs);
}
