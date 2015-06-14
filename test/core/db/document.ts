import _ = require('underscore');
import assert = require('assert');
import mongodb = require('mongodb');
import Collection = require('../../../core/db/collection');
import Document = require('../../../core/db/document');
import Query = require('../../../core/db/query');
import Schema = require('../../../core/db/schema');
import Type = require('../../../core/db/schema/type');
import convertToJSON = require('../../common//convert-to-json');
import testDb = require('../../common/db');

describe('#document', () => {
  before((done: MochaDone) => {
    testDb.connect().nodify(done);
  });

  after((done: MochaDone) => {
    testDb.close(true).nodify(done);
  });

  it('doc.objectId getter returns hex string of MongoDb ObjectId.', () => {
    let testSchema = new Schema(1, { });
    let testCollection = new Collection("beyondTestCollection", testSchema);
    assert.equal(testCollection.constructor, Collection);

    let hexString = "abcdef0123456789abcdef01";
    let oid = new mongodb.ObjectID(hexString);
    let doc = new Document({ _id: oid }, testCollection);
    assert.equal(doc.objectId, hexString);
  });

  it('Cannot set objectId.', () => {
    let testSchema = new Schema(1, { array: { type: Type.array, elementType: { type: Type.integer } }, name: { type: Type.string }, num: { type: Type.integer } });
    let testCollection = new Collection("beyondTestCollection", testSchema);
    assert.equal(testCollection.constructor, Collection);

    let hexString = "abcdef0123456789abcdef01";
    let oid = new mongodb.ObjectID(hexString);
    let rawDoc = { _id: oid, array: [ 1, 2, 3 ], name: 'string', num: 4 };
    let doc: any = new Document(rawDoc, testCollection);

    assert.equal(doc.name(), rawDoc.name);
    assert.equal(doc.num(), rawDoc.num);
    assert.deepEqual(doc.array(), rawDoc.array);

    let newHexString = "abcdef0123456789abcdef02";
    doc.objectId = newHexString;
    assert.equal(doc.objectId, hexString);
  });

  it('doc._id getter returns MongoDb ObjectId.', () => {
    let testSchema = new Schema(1, { });
    let testCollection = new Collection("beyondTestCollection", testSchema);
    assert.equal(testCollection.constructor, Collection);

    let hexString = "abcdef0123456789abcdef01";
    let oid = new mongodb.ObjectID(hexString);
    let doc = new Document({ _id: oid }, testCollection);
    assert(oid.equals(doc._id));
  });

  it('Cannot set doc._id ', () => {
    let testSchema = new Schema(1, { });
    let testCollection = new Collection("beyondTestCollection", testSchema);
    assert.equal(testCollection.constructor, Collection);

    let hexString = "abcdef0123456789abcdef01";
    let oid = new mongodb.ObjectID(hexString);
    let doc = new Document({ _id: oid }, testCollection);
    assert(oid.equals(doc._id));

    let newHexString = "abcdef0123456789abcdef02";
    let newOid = new mongodb.ObjectID(newHexString);
    doc._id = newOid;
    assert(oid.equals(doc._id));
  });

  it('JSON.stringify(doc) returns the stringified document.', () => {
    let testSchema = new Schema(1, { });
    let testCollection = new Collection("beyondTestCollection", testSchema);
    assert.equal(testCollection.constructor, Collection);

    let hexString = "abcdef0123456789abcdef01";
    let oid = new mongodb.ObjectID(hexString);
    let rawDoc = { _id: oid, array: [ 1, 2, 3 ], name: 'string', num: 4 };
    let doc = new Document(rawDoc, testCollection);
    assert.equal(JSON.stringify(rawDoc), JSON.stringify(doc));
  });

  it('JSON.stringify(doc) returns the stringified document of updated values.', () => {
    let testSchema = new Schema(1, { array: { type: Type.array, elementType: { type: Type.integer } }, name: { type: Type.string }, num: { type: Type.integer } });
    let testCollection = new Collection("beyondTestCollection", testSchema);
    assert.equal(testCollection.constructor, Collection);

    let hexString = "abcdef0123456789abcdef01";
    let oid = new mongodb.ObjectID(hexString);
    let rawDoc = { _id: oid, array: [ 1, 2, 3 ], name: 'string', num: 4 };
    let doc: any = new Document(rawDoc, testCollection);
    assert(_.isString(JSON.stringify(doc)));

    let newRawDoc = { _id: oid, array: [ 1, 2, 3 ], name: 'new string', num: 4 };
    doc.name(newRawDoc.name);
    assert(_.isString(JSON.stringify(doc)));
  });

  it('Document getter function return original value if not modified.', () => {
    let testSchema = new Schema(1, { array: { type: Type.array, elementType: { type: Type.integer } }, name: { type: Type.string }, num: { type: Type.integer } });
    let testCollection = new Collection("beyondTestCollection", testSchema);
    assert.equal(testCollection.constructor, Collection);

    let hexString = "abcdef0123456789abcdef01";
    let oid = new mongodb.ObjectID(hexString);
    let rawDoc = { _id: oid, array: [ 1, 2, 3 ], name: 'string', num: 4 };
    let doc: any = new Document(rawDoc, testCollection);

    assert.equal(doc.name(), rawDoc.name);
    assert.equal(doc.num(), rawDoc.num);
    assert.deepEqual(doc.array(), rawDoc.array);
  });

  it('Document getter function return updated value if not modified.', () => {
    let testSchema = new Schema(1, { array: { type: Type.array, elementType: { type: Type.integer } }, name: { type: Type.string }, num: { type: Type.integer } });
    let testCollection = new Collection("beyondTestCollection", testSchema);
    assert.equal(testCollection.constructor, Collection);

    let hexString = "abcdef0123456789abcdef01";
    let oid = new mongodb.ObjectID(hexString);
    let rawDoc = { _id: oid, array: [ 1, 2, 3 ], name: 'string', num: 4 };
    let doc: any = new Document(rawDoc, testCollection);

    assert.equal(doc.name(), rawDoc.name);
    assert.equal(doc.num(), rawDoc.num);
    assert.deepEqual(doc.array(), rawDoc.array);

    let newName = 'new name';
    let newArray = [ 1, 2, 3, 4, 5 ];
    doc.name(newName);
    assert.equal(doc.name(), newName);
    assert.equal(doc.num(), rawDoc.num);
    doc.array(newArray);
    assert.deepEqual(doc.array(), newArray);
  });

  it('Expose document.', () => {
    let testSchema = new Schema(1, { array: { type: Type.array, elementType: { type: Type.integer } }, name: { type: Type.string }, num: { type: Type.integer } });
    let testCollection = new Collection("beyondTestCollection", testSchema);
    assert.equal(testCollection.constructor, Collection);

    let hexString = "abcdef0123456789abcdef01";
    let oid = new mongodb.ObjectID(hexString);
    let rawDoc = { _id: oid, array: [ 1, 2, 3 ], name: 'string', num: 4 };
    let doc: any = new Document(rawDoc, testCollection);
    assert.deepEqual(rawDoc, doc.doc);

    let newRawDoc = { _id: oid, array: [ 1, 2, 3 ], name: 'new string', num: 4 };
    doc.name(newRawDoc.name);
    assert.deepEqual(newRawDoc, doc.doc);
  });

  describe('#helper methods to change db without collection.', () => {
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

    it('remove method deletes itself.', (done: MochaDone) => {
      let query = Query.eq('firstName', 'First');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'First' });

      testCollection.findOne(query)
      .flatMap((doc) => {
        return testCollection.find(Query.eq('_id', doc._id));
      }).map((docs: any[]) => {
        assert.equal(docs.length, 1);
        return docs[0];
      }).flatMap((doc) => {
        return doc.remove()
        .map(() => {
          return doc._id;
        });
      }).flatMap((id) => {
        return testCollection.find(Query.eq('_id', id));
      }).map((docs: any[]) => {
        assert.equal(docs.length, 0);
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

        return doc.save();
      }).flatMap((doc: any) => {
        assert.equal(doc.firstName(), 'new first name');
        assert.equal(doc.lastName(), doc0.lastName);
        assert.equal(doc.age(), doc0.age);

        return testCollection.findOne(Query.eq('_id', doc._id));
      }).nodify(done);
    });

    it('should success to save with non changed document', (done: MochaDone) => {
      let query = Query.eq('firstName', 'First');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'firstName': 'First' });

      testCollection.findOne(query)
      .flatMap((doc: any) => {
        assert.deepEqual(convertToJSON(doc.body), convertToJSON(doc0));

        assert.equal(doc.firstName(), doc0.firstName);
        assert.equal(doc.lastName(), doc0.lastName);
        assert.equal(doc.age(), doc0.age);

        return doc.save();
      }).flatMap((doc: any) => {
        assert.deepEqual(_.omit(doc.doc, '_id'), doc0);

        return testCollection.findOne(Query.eq('_id', doc._id));
      }).map((doc: any) => {
        assert.deepEqual(_.omit(doc.doc, '_id'), doc0);
        return doc;
      }).nodify(done);
    });

    it('Cannot save the removed document', (done: MochaDone) => {
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

        return doc.save();
      }).onSuccess(() => {
        done(new Error('cannot reach here'));
      }).onFailure((err: any) => {
        assert.equal(err.result.ok, 1);
        assert.equal(err.result.n, 0);
        done();
      });
    });
  });
});
