import Future = require('sfuture');
import _ = require('underscore');
import assert = require('assert');
import Index = require('../../../core/db/index');
import db = require('../../../core/db');
import testDb = require('../../common/db');

describe('db.schema.index', () => {
  describe('with mongodb', () => {
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

    let findMatchedIndexWithKey = (index: Index): Future<any> => {
      let mongoDb = db.connection();
      return Future.denodify(mongoDb.indexInformation, mongoDb, testDb.TestCollectionName, { full: true })
      .map((indices: any[]) => {
        let matchedIndex = _.find(indices, (elem: any) => {
          return _.isEqual(elem.key, index.key);
        });

        return matchedIndex;
      });
    };

    it('create single field unique index.', (done: MochaDone) => {
      let index = new Index({ 'someField': 1 }, { unique: true });

      findMatchedIndexWithKey(index)
      .map((index: any) => {
        assert.equal(index, undefined);
      }).flatMap(() => {
        let mongoDb = db.connection();
        return index.createIndex(mongoDb, testDb.TestCollectionName);
      }).flatMap((name: string) => {
        return findMatchedIndexWithKey(index)
        .map((index: any) => {
          assert(!_.isUndefined(index));
          assert.equal(index.name, name);
        });
      }).nodify(done);
    });

    it('create single field index.', (done: MochaDone) => {
      let index = new Index({ 'someField': 1 });

      findMatchedIndexWithKey(index)
      .map((index: any) => {
        assert.equal(index, undefined);
      }).flatMap(() => {
        let mongoDb = db.connection();
        return index.createIndex(mongoDb, testDb.TestCollectionName);
      }).flatMap((name: string) => {
        return findMatchedIndexWithKey(index)
        .map((index: any) => {
          assert(!_.isUndefined(index));
          assert.equal(index.name, name);
        });
      }).nodify(done);
    });

    it('create single field hashed index.', (done: MochaDone) => {
      let index = new Index({ 'someField': 'hashed' });

      findMatchedIndexWithKey(index)
      .map((index: any) => {
        assert.equal(index, undefined);
      }).flatMap(() => {
        let mongoDb = db.connection();
        return index.createIndex(mongoDb, testDb.TestCollectionName);
      }).flatMap((name: string) => {
        return findMatchedIndexWithKey(index)
        .map((index: any) => {
          assert(!_.isUndefined(index));
          assert.equal(index.name, name);
        });
      }).nodify(done);
    });
  });
});
