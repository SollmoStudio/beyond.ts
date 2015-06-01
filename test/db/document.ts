import assert = require('assert');
import mongodb = require('mongodb');
import Document = require('../../lib/db/document');
import Schema = require('../../lib/db/schema');
import db = require('../../lib/db');
import util = require('./util');

describe('#document', () => {
  before((done: MochaDone) => {
    util.connect(done);
  });

  after((done: MochaDone) => {
    util.close(true, done);
  });

  it('doc.objectId getter returns hex string of MongoDb ObjectId.', () => {
    let testSchema = new Schema(1, { });
    let testCollection = new db.Collection("beyondTestCollection", testSchema);
    assert.equal(testCollection.constructor, db.Collection);

    let hexString = "abcdef0123456789abcdef01";
    let oid = new mongodb.ObjectID(hexString);
    let doc = new Document({ _id: oid }, testCollection);
    assert.equal(doc.objectId, hexString);
  });

  it('JSON.stringify(doc) returns the stringified document.', () => {
    let testSchema = new Schema(1, { });
    let testCollection = new db.Collection("beyondTestCollection", testSchema);
    assert.equal(testCollection.constructor, db.Collection);

    let hexString = "abcdef0123456789abcdef01";
    let oid = new mongodb.ObjectID(hexString);
    let rawDoc = { _id: oid, array: [ 1, 2, 3 ], name: 'string', num: 4 };
    let doc = new Document(rawDoc, testCollection);
    assert.equal(JSON.stringify(rawDoc), JSON.stringify(doc));
  });
});
