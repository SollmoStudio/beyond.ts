import Future = require('sfuture');
import assert = require('assert');
import Schema = require('../../lib/db/schema');
import Type = require('../../lib/db/schema/type');
import connection = require('../../lib/db/connection');
import db = require('../../lib/db');
import util = require('./util');

describe('db.collection', () => {
  before((done: MochaDone) => {
    util.connect(done);
  });

  after((done: MochaDone) => {
    util.close(true, done);
  });

  beforeEach((done: MochaDone) => {
    let mongoConnection = connection.connection();
    mongoConnection.createCollection('beyondTestCollection', done);
  });

  afterEach((done: MochaDone) => {
    let mongoConnection = connection.connection();
    mongoConnection.dropCollection('beyondTestCollection', done);
  });

  describe('#constructor', () => {
    it('create Collection with schema', () => {
      let userSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer }
      });
      let userCollection = new db.Collection("beyondTestCollection", userSchema);
      assert.equal(userCollection.constructor, db.Collection);
    });
  });

  describe('#insert', () => {
    it('insert one document.', (done) => {
      let userSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer }
      });
      let userCollection = new db.Collection("beyondTestCollection", userSchema);
      assert.equal(userCollection.constructor, db.Collection);

      let document = {'firstName': 'name', 'lastName': 'last', age: 20};
      userCollection
      .insert(document)
      .flatMap(() => {
        let mongoConnection = connection.connection();
        let collection = mongoConnection.collection('beyondTestCollection');
        let cursor = collection.find({});
        return Future.denodify(cursor.toArray, cursor);
      }).map((docs: any[]) => {
        assert.equal(docs.length, 1);
        assert.deepEqual(docs[0], document);
        return docs;
      })
      .nodify(done);
    });
  });
});
