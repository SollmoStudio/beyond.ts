import Future = require('sfuture');
import assert = require('assert');
import mongodb = require('mongodb');
import util = require('util');
import db = require('../../../core/db');
import DataLogger = require('../../../core/logger/data');
import testDB = require('../../common/db');

describe('data logger', () => {
  describe('#initialize', () => {
    it('collection name cannot be empty', () => {
      const config: any = { 'test': 'mongodb:' };
      assert.throws(() => {
        DataLogger.create(config);
      });
    });

    it('Cannot initialize with invalid option', () => {
      const config: any = { 'test': 'some other' };
      assert.throws(() => {
        DataLogger.create(config);
      });
    });

    it('Initialize with array', () => {
      const config: any = { 'test': ['stdout', 'stderr'] };
      DataLogger.create(config);
    });
  });

  describe('logging to mongodb', () => {
    let collection: mongodb.Collection = null;
    const TAG = 'test';

    const mongoConfig: string = util.format('mongodb:%s', testDB.TestCollectionName);
    const config: any = {
      [TAG]: mongoConfig,
    };

    before((done: MochaDone) => {
      testDB.connect()
      .map(() => {
        collection = db.connection().collection(testDB.TestCollectionName);
      }).nodify(done);
    });

    after((done: MochaDone) => {
      testDB.close(true).nodify(done);
    });

    beforeEach((done: MochaDone) => {
      testDB.cleanupCollection().nodify(done);
    });

    it('data logger can save object data.', (done: MochaDone) => {
      const message = 'log message %d';
      const DATA = { some: 'object', is: 'saved', at: new Date() };

      let dataLogger = DataLogger.create(config);

      dataLogger(TAG, DATA, message, [ 1 ])
      .flatMap(() => {
        return Future.denodify(collection.find, collection, { });
      }).flatMap((cursor: mongodb.Cursor) => {
        return Future.denodify(cursor.toArray, cursor);
      }).map((logs: any[]) => {
        assert.equal(logs.length, 1);

        assert.equal(logs[0].tag, TAG);
        assert.equal(logs[0].message, util.format(message, 1));
        assert.deepEqual(logs[0].data, DATA);
      }).nodify(done);
    });

    it('data logger can save string.', (done: MochaDone) => {
      const message = 'log message %d';
      const DATA = 'some data string';

      let dataLogger = DataLogger.create(config);

      dataLogger(TAG, DATA, message, [ 2 ])
      .flatMap(() => {
        return Future.denodify(collection.find, collection, { });
      }).flatMap((cursor: mongodb.Cursor) => {
        return Future.denodify(cursor.toArray, cursor);
      }).map((logs: any[]) => {
        assert.equal(logs.length, 1);

        assert.equal(logs[0].tag, TAG);
        assert.equal(logs[0].message, util.format(message, 2));
        assert.equal(logs[0].data, DATA);
      }).nodify(done);
    });
  });
});
