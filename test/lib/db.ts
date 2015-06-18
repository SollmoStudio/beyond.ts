import _ = require('underscore');
import assert = require('assert');
import Collection = require('../../lib/db/collection');
import Query = require('../../lib/db/query');
import Schema = require('../../lib/db/schema');
import Type = require('../../lib/db/schema/type');
import db = require('../../lib/db');
import testDb = require('../common/db');

describe('db.collection', () => {
  const doc0 = { firstName: 'First', lastName: 'Name', age: 21 };
  const doc1 = { firstName: 'Second', lastName: 'Name', age: 30 };
  const doc2 = { firstName: 'Third', lastName: 'Name', age: 25 };

  let testCollection: Collection = undefined;

  before((done: MochaDone) => {
    testDb.connect()
    .flatMap(() => {
      let userSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer, min: 0 }
      });
      testCollection = new Collection(testDb.TestCollectionName, userSchema);
      assert.equal(testCollection.constructor, Collection);

      let documents = [
        _.clone(doc0), _.clone(doc1), _.clone(doc2)
      ];

      return testDb.cleanupCollection()
      .flatMap(() => {
        return testDb.setupData(...documents);
      });
    }).nodify(done);
  });

  after((done: MochaDone) => {
    testDb.close(true)
    .nodify(done);
  });

  describe('#ObjectId', () => {
    it('find with ObjectId()', (done: MochaDone) => {
      testCollection.findOne(Query.eq('firstName', doc0.firstName))
      .flatMap((doc: any) => {
        return testCollection.findOne(Query.eq('_id', db.ObjectId(doc.objectId)));
      }).map((doc: any) => {
        assert.equal(doc.firstName(), doc0.firstName);
      }).nodify(done);
    });
  });

  describe('#sort', () => {
    it('ASC', (done: MochaDone) => {
      testCollection.find(Query.all(), { sort: { age: db.ASC } })
      .map((docs: any[]) => {
        assert.equal(docs.length, 3);
        assert.deepEqual(doc0.age, docs[0].age());
        assert.deepEqual(doc2.age, docs[1].age());
        assert.deepEqual(doc1.age, docs[2].age());
      }).nodify(done);
    });

    it('DESC', (done: MochaDone) => {
      testCollection.find(Query.all(), { sort: { age: db.DESC } })
      .map((docs: any[]) => {
        assert.equal(docs.length, 3);
        assert.deepEqual(doc1.age, docs[0].age());
        assert.deepEqual(doc2.age, docs[1].age());
        assert.deepEqual(doc0.age, docs[2].age());
      }).nodify(done);
    });
  });
});
