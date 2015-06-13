import _ = require('underscore');
import assert = require('assert');
import Collection = require('../../../core/db/collection');
import convertToJSON = require('../../common//convert-to-json');
import Document = require('../../../core/db/document');
import Query = require('../../../core/db/query');
import Schema = require('../../../core/db/schema');
import Type = require('../../../core/db/schema/type');
import mongodb = require('mongodb');
import testDb = require('../../common/db');

describe('db.collection', () => {
  before((done: MochaDone) => {
    testDb.connect().nodify(done);
  });

  after((done: MochaDone) => {
    testDb.close(true).nodify(done);
  });

  beforeEach((done: MochaDone) => {
    testDb.cleanupCollection()
    .nodify(done);
  });

  describe('#constructor', () => {
    it('create Collection with schema', () => {
      let userSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer }
      });
      let userCollection = new Collection(testDb.TestCollectionName, userSchema);
      assert.equal(userCollection.constructor, Collection);
    });
  });

  describe('#insert', () => {
    it('insert one document.', (done) => {
      let userSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer }
      });
      let userCollection = new Collection(testDb.TestCollectionName, userSchema);
      assert.equal(userCollection.constructor, Collection);

      let document = {'firstName': 'name', 'lastName': 'last', age: 20};
      userCollection
      .insert(document)
      .flatMap((doc: any) => {
        assert.equal(doc.firstName(), document.firstName);
        assert.equal(doc.lastName(), document.lastName);
        assert.equal(doc.age(), document.age);

        return userCollection.find(Query.all());
      }).map((docs: any[]) => {
        assert.equal(docs.length, 1);
        assert.deepEqual(convertToJSON(docs[0].body), convertToJSON(document));
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
      let userCollection = new Collection(testDb.TestCollectionName, userSchema);
      assert.equal(userCollection.constructor, Collection);

      let document1 = {'firstName': 'name1', 'lastName': 'last1', age: 21};
      let document2 = {'firstName': 'name2', 'lastName': 'last2', age: 22};
      userCollection
      .insert(document1, document2)
      .flatMap((docs: any[]) => {
        assert(_.isArray(docs));
        assert.equal(docs.length, 2);

        let doc0 = docs[0];
        assert.equal(doc0.firstName(), document1.firstName);
        assert.equal(doc0.lastName(), document1.lastName);
        assert.equal(doc0.age(), document1.age);

        let doc1 = docs[1];
        assert.equal(doc1.firstName(), document2.firstName);
        assert.equal(doc1.lastName(), document2.lastName);
        assert.equal(doc1.age(), document2.age);

        return userCollection.find(Query.all(), { limit: 2, sort: { age: 1 /* ASC */ } });
      }).map((docs: any[]) => {
        assert.equal(docs.length, 2);
        assert.deepEqual(convertToJSON(docs[1].body), convertToJSON(document2));
        assert.deepEqual(convertToJSON(docs[0].body), convertToJSON(document1));
        return docs;
      }).flatMap(() => {
        return userCollection.find(Query.all(), { limit: 5, sort: { age: -1 /* DESC */ } });
      }).map((docs: any[]) => {
        assert.equal(docs.length, 2);
        assert.deepEqual(convertToJSON(docs[0].body), convertToJSON(document2));
        assert.deepEqual(convertToJSON(docs[1].body), convertToJSON(document1));
        return docs;
      })
      .nodify(done);
    });

    it('insert fails if the ObjectId is duplicated.', (done) => {
      let userSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer }
      });
      let userCollection = new Collection(testDb.TestCollectionName, userSchema);
      assert.equal(userCollection.constructor, Collection);

      let document0 = {
        '_id': new mongodb.ObjectID(),
        'firstName': 'name', 'lastName': 'last', age: 20
      };
      let document1 = {
        '_id': document0._id,
        'firstName': 'name2', 'lastName': 'last2', age: 21
      };

      userCollection
      .insert(document0)
      .flatMap((doc: any) => {
        assert.equal(doc.firstName(), document0.firstName);
        assert.equal(doc.lastName(), document0.lastName);
        assert.equal(doc.age(), document0.age);

        return userCollection.find(Query.all());
      }).flatMap((docs: any[]) => {
        assert.equal(docs.length, 1);
        const d0 = docs[0];
        const d1 = document0;
        assert(d0._id.equals(d1._id));
        assert.equal(d0.firstName(), d1.firstName);
        assert.equal(d0.lastName(), d1.lastName);
        assert.equal(d0.age(), d1.age);
        return userCollection.insert(document1);
      }).recover((err: any) => {
        assert(err instanceof Error);
        assert.equal(err.code, 11000);
        return;
      }).andThen(() => {
        return;
      }).nodify(done);
    });

    it('insert fails when not validated.', (done) => {
      let userSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer, min: 0 }
      });
      let userCollection = new Collection(testDb.TestCollectionName, userSchema);
      assert.equal(userCollection.constructor, Collection);

      let document = {
        '_id': new mongodb.ObjectID(),
        'firstName': 'name', 'lastName': 'last', age: -1
      };

      userCollection
      .insert(document)
      .onSuccess(() => {
        assert(false, 'Cannot success');
      }).onFailure((err: Error) => {
        assert(err instanceof Error);
        done();
      });
    });
  });

  describe('#remove', () => {
    let doc0 = { firstName: 'First', lastName: 'Name', age: 21 };
    let doc1 = { firstName: 'Second', lastName: 'Name', age: 22 };

    let testCollection: Collection = undefined;

    before(() => {
      let userSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer, min: 0 }
      });
      testCollection = new Collection(testDb.TestCollectionName, userSchema);
      assert.equal(testCollection.constructor, Collection);
    });

    beforeEach((done: MochaDone) => {
      let documents = [
        _.clone(doc0), _.clone(doc1)
      ];
      testDb.setupData(...documents)
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
        assert.deepEqual(convertToJSON(docs[0].body), convertToJSON(doc0));
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
        assert.deepEqual(convertToJSON(docs[0].body), convertToJSON(doc1));
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
        assert.deepEqual(convertToJSON(doc.body), convertToJSON(doc0));
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
        assert.deepEqual(convertToJSON(docs[0].body), convertToJSON(doc0));
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

    it('findOneAndRemove returns document and removes it', (done: MochaDone) => {
      let query = Query.eq('firstName', 'First');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'First' });

      testCollection.findOneAndRemove(query)
      .flatMap((doc: any) => {
        assert.deepEqual(convertToJSON(doc0), convertToJSON(doc.body));

        let query = Query.eq('_id', doc._id);
        return testCollection.findOne(query);
      }).onSuccess((doc: any) => {
        assert.equal(doc, null);
      }).nodify(done);
    });

    it('findOneAndRemove returns null if not exists', (done: MochaDone) => {
      let query = Query.eq('firstName', 'Not in db');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'Not in db' });

      testCollection.findOneAndRemove(query)
      .onSuccess((doc: any) => {
        assert.equal(null, doc);
      }).andThen(() => {
        return;
      }).nodify(done);
    });

    it('findOneAndRemove removes only one that returned', (done: MochaDone) => {
      let query = Query.all();
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { });

      testCollection.findOneAndRemove(query, { age: 1 /* ASC */ })
      .map((doc: any) => {
        assert.deepEqual(convertToJSON(doc0), convertToJSON(doc.body));
        return doc._id;
      }).flatMap((id: any) => {
        let query = Query.ne('_id', id);
        assert(query.constructor === Query);

        return testCollection.find(query);
      }).onSuccess((docs: any[]) => {
        assert.equal(docs.length, 1);
        assert.deepEqual(convertToJSON(docs[0].body), convertToJSON(doc1));
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

    it('find returns empty array if not matched.', (done: MochaDone) => {
      let query = Query.eq('firstName', 'not in db');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'not in db' });

      testCollection.find(query)
      .onSuccess((docs: any[]) => {
        assert.equal(docs.length, 0);
      }).nodify(done);
    });

    it('findOne returns null if not matched.', (done: MochaDone) => {
      let query = Query.eq('firstName', 'not in db');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'not in db' });

      testCollection.findOne(query)
      .onSuccess((doc: any) => {
        assert.equal(doc, null);
      }).nodify(done);
    });

    it('save changed document', (done: MochaDone) => {
      let query = Query.eq('firstName', 'First');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'First' });

      testCollection.findOne(query)
      .flatMap((doc: any) => {
        assert.deepEqual(convertToJSON(doc.body), convertToJSON(doc0));

        assert.equal(doc.firstName(), doc0.firstName);
        assert.equal(doc.lastName(), doc0.lastName);
        assert.equal(doc.age(), doc0.age);
        doc.firstName('new first name');
        assert.equal(doc.firstName(), 'new first name');
        assert.equal(doc.lastName(), doc0.lastName);
        assert.equal(doc.age(), doc0.age);

        return testCollection.update(doc);
      }).flatMap((doc: any) => {
        assert.equal(doc.firstName(), 'new first name');
        assert.equal(doc.lastName(), doc0.lastName);
        assert.equal(doc.age(), doc0.age);

        return testCollection.findOne(Query.eq('_id', doc._id));
      }).andThen(() => {
        return;
      }).nodify(done);
    });

    it('should success to update with non changed document', (done: MochaDone) => {
      let query = Query.eq('firstName', 'First');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'First' });

      testCollection.findOne(query)
      .flatMap((doc: any) => {
        assert.deepEqual(convertToJSON(doc.body), convertToJSON(doc0));

        assert.equal(doc.firstName(), doc0.firstName);
        assert.equal(doc.lastName(), doc0.lastName);
        assert.equal(doc.age(), doc0.age);

        return testCollection.update(doc);
      }).flatMap((doc: any) => {
        assert.deepEqual(_.omit(doc.doc, '_id'), doc0);

        return testCollection.findOne(Query.eq('_id', doc._id));
      }).map((doc: any) => {
        assert.deepEqual(_.omit(doc.doc, '_id'), doc0);
        return doc;
      }).nodify(done);
    });

    it('Cannot save removed document', (done: MochaDone) => {
      let query = Query.eq('firstName', 'First');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'First' });

      testCollection.findOneAndRemove(query)
      .flatMap((doc: any) => {
        assert.deepEqual(convertToJSON(doc.body), convertToJSON(doc0));

        assert.equal(doc.firstName(), doc0.firstName);
        assert.equal(doc.lastName(), doc0.lastName);
        assert.equal(doc.age(), doc0.age);
        doc.firstName('new first name');
        assert.equal(doc.firstName(), 'new first name');
        assert.equal(doc.lastName(), doc0.lastName);
        assert.equal(doc.age(), doc0.age);

        return testCollection.update(doc);
      }).onSuccess(() => {
        assert(false, 'cannot reach here');
      }).onFailure((err: any) => {
        assert.equal(err.result.ok, 1);
        assert.equal(err.result.n, 0);
        done();
      });
    });

    it('Cannot save removed document', (done: MochaDone) => {
      let query = Query.eq('firstName', 'First');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'First' });

      testCollection.findOne(query)
      .flatMap((doc: any) => {
        assert.deepEqual(convertToJSON(doc.body), convertToJSON(doc0));

        assert.equal(doc.firstName(), doc0.firstName);
        assert.equal(doc.lastName(), doc0.lastName);
        assert.equal(doc.age(), doc0.age);
        doc.age(-5);
        assert.equal(doc.firstName(), doc0.firstName);
        assert.equal(doc.lastName(), doc0.lastName);
        assert.equal(doc.age(), -5);

        return testCollection.update(doc);
      }).map(() => {
        assert(false, 'cannot reach here');
      }).recover((err: any) => {
        return;
      }).onComplete(done);
    });
  });
});
