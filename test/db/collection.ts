import _ = require('underscore');
import assert = require('assert');
import Collection = require('../../lib/db/collection');
import Document = require('../../lib/db/document');
import Query = require('../../lib/db/query');
import Schema = require('../../lib/db/schema');
import Type = require('../../lib/db/schema/type');
import db = require('../../lib/db');
import util = require('./util');

describe('db.collection', () => {
  before((done: MochaDone) => {
    util.connect().nodify(done);
  });

  after((done: MochaDone) => {
    util.close(true).nodify(done);
  });

  beforeEach((done: MochaDone) => {
    util.cleanupCollection()
    .nodify(done);
  });

  describe('#constructor', () => {
    it('create Collection with schema', () => {
      let userSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer }
      });
      let userCollection = new db.Collection(util.TestCollectionName, userSchema);
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
      let userCollection = new db.Collection(util.TestCollectionName, userSchema);
      assert.equal(userCollection.constructor, db.Collection);

      let document = {'firstName': 'name', 'lastName': 'last', age: 20};
      userCollection
      .insert(document)
      .flatMap(() => {
        return userCollection.find(Query.all());
      }).map((docs: any[]) => {
        assert.equal(docs.length, 1);
        assert.deepEqual(docs[0], document);
        return docs;
      })
      .nodify(done);
    });

    it('insert documents.', (done) => {
      let userSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer }
      });
      let userCollection = new db.Collection(util.TestCollectionName, userSchema);
      assert.equal(userCollection.constructor, db.Collection);

      let document1 = {'firstName': 'name1', 'lastName': 'last1', age: 21};
      let document2 = {'firstName': 'name2', 'lastName': 'last2', age: 22};
      userCollection
      .insert(document1, document2)
      .flatMap(() => {
        return userCollection.find({}, { limit: 2, sort: { age: db.ASC } });
      }).map((docs: any[]) => {
        assert.equal(docs.length, 2);
        assert.deepEqual(docs[1], document2);
        assert.deepEqual(docs[0], document1);
        return docs;
      }).flatMap(() => {
        return userCollection.find({}, { limit: 5, sort: { age: db.DESC } });
      }).map((docs: any[]) => {
        assert.equal(docs.length, 2);
        assert.deepEqual(docs[0], document2);
        assert.deepEqual(docs[1], document1);
        return docs;
      })
      .nodify(done);
    });
  });

  describe('#remove', () => {
    let doc0 = { firstName: 'First', lastName: 'Name', age: 21 };
    let doc1 = { firstName: 'Second', lastName: 'Name', age: 22 };
    let documents = [
      doc0, doc1
    ];

    let testCollection: Collection = undefined;

    before(() => {
      let userSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer }
      });
      testCollection = new db.Collection(util.TestCollectionName, userSchema);
      assert.equal(testCollection.constructor, db.Collection);
    });

    beforeEach((done: MochaDone) => {
      util.setupData(...documents)
      .nodify(done);
    });

    it('eq query', (done: MochaDone) => {
      let query = Query.eq('firstName', 'Second');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'Second' });

      testCollection.remove(query)
      .flatMap(() => {
        return testCollection.find(Query.all());
      }).map((docs: any[]) => {
        assert.equal(docs.length, 1);
        assert.equal(JSON.stringify(docs[0]), JSON.stringify(doc0));
      }).nodify(done);
    });

    it('ne query', (done: MochaDone) => {
      let query = Query.ne('firstName', 'Second');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': { '$ne': 'Second' } });

      testCollection.remove(query)
      .flatMap(() => {
        return testCollection.find(Query.all());
      }).map((docs: any[]) => {
        assert.equal(docs.length, 1);
        assert.equal(JSON.stringify(docs[0]), JSON.stringify(doc1));
      }).nodify(done);
    });

    it('remove multiple documents', (done: MochaDone) => {
      let query = Query.eq('lastName', 'Name');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'lastName': 'Name' });

      testCollection.remove(query)
      .flatMap(() => {
        return testCollection.find(Query.all());
      }).map((docs: any[]) => {
        assert.equal(docs.length, 0);
      }).nodify(done);
    });

    it('remove only one document', (done: MochaDone) => {
      let query = Query.eq('lastName', 'Name');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'lastName': 'Name' });

      testCollection.removeOne(query)
      .flatMap(() => {
        return testCollection.find(Query.all());
      }).map((docs: any[]) => {
        assert.equal(docs.length, 1);
      }).nodify(done);
    });

    it('findOne return one Document', (done: MochaDone) => {
      let query = Query.eq('firstName', 'First');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'First' });

      testCollection.findOne(query)
      .onSuccess((doc: Document) => {
        assert.equal(JSON.stringify(doc), JSON.stringify(doc0));
      }).andThen(() => {
        return;
      }).nodify(done);
    });

    it('find returns an array of Document if there is only one matched document', (done: MochaDone) => {
      let query = Query.eq('firstName', 'First');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'First' });

      testCollection.find(query)
      .onSuccess((docs: Document[]) => {
        assert(_.isArray(docs));
        assert.equal(docs.length, 1);
        assert.equal(JSON.stringify(docs[0]), JSON.stringify(doc0));
      }).andThen(() => {
        return;
      }).nodify(done);
    });

    it('find returns an array of Documents if there are many matched document', (done: MochaDone) => {
      let query = Query.ne('firstName', 'Third');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': { '$ne': 'Third' } });

      testCollection.find(query)
      .onSuccess((docs: Document[]) => {
        assert(_.isArray(docs));
        assert.equal(docs.length, 2);
      }).andThen(() => {
        return;
      }).nodify(done);
    });

    it('find returns an empty array if there are no matched document', (done: MochaDone) => {
      let query = Query.nin('firstName', [ 'First', 'Second' ]);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': { '$nin': [ 'First', 'Second' ] } });

      testCollection.find(query)
      .onSuccess((docs: Document[]) => {
        assert(_.isArray(docs));
        assert.equal(docs.length, 0);
      }).andThen(() => {
        return;
      }).nodify(done);
    });

    it('removeOne document with document', (done: MochaDone) => {
      let query = Query.eq('firstName', 'First');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'First' });

      testCollection.findOne(query)
      .flatMap((doc: Document) => {
        return testCollection.removeOne(doc);
      }).flatMap((doc: Document) => {
        return testCollection.findOne(query)
        .andThen((err: Error, doc: Document) => {
          assert.ifError(err);
          assert.equal(doc, null);
        });
      }).nodify(done);
    });

    it('count', (done: MochaDone) => {
      let query = Query.eq('firstName', 'Second');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'Second' });

      testCollection.count(query)
      .onSuccess((count: number) => {
        assert.equal(count, 1);
        done();
      }).onFailure(done);
    });
  });
});
