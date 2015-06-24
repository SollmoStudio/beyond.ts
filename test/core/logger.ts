import Future = require('sfuture');
import assert = require('assert');
import mongodb = require('mongodb');
import util = require('util');
import db = require('../../core/db');
import logger = require('../../core/logger');
import testDB = require('../common/db');

describe('#logger', () => {
  describe('#uninitialized', () => {
    describe('#message log do nothing if not initialized', () => {
      logger.message('log', 'Log do nothing if not %s', [ 'initialized' ]);
    });
    describe('#data log do nothing if not initialized', () => {
      logger.data('TEST', { some: 'object' }, 'data do nothing if not %s', [ 'initialized' ]);
    });
  });

  describe('#initialized', () => {
    let collection: mongodb.Collection = null;

    const mongoConfig = util.format('mongodb:%s', testDB.TestCollectionName);

    const TAGS: any = { 'test': mongoConfig };
    const LEVELS: any = {
      'log': mongoConfig,
      'info': mongoConfig,
      'warn': mongoConfig,
      'debug': mongoConfig,
      'error': mongoConfig
    };

    before((done: MochaDone) => {
      logger.initialize(LEVELS, TAGS);

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

    it('#log', (done: MochaDone) => {
      const message = 'logging %s';

      logger.message('log', message, [ 'something' ])
      .flatMap(() => {
        return Future
        .denodify(collection.find, collection, { })
        .flatMap((cursor: mongodb.Cursor) => {
          return Future.denodify(cursor.toArray, cursor);
        });
      }).map((logs: any[]) => {
        assert.equal(logs.length, 1);
        assert.equal(logs[0].level, 'log');
        assert.equal(logs[0].message, 'logging something');
        assert(logs[0].date);
      }).nodify(done);
    });

    it('data logger can save object data.', (done: MochaDone) => {
      const message = 'log message %d';
      const DATA = { some: 'object', is: 'saved', at: new Date() };

      logger.data('test', DATA, message, [ 1 ])
      .flatMap(() => {
        return Future.denodify(collection.find, collection, { });
      }).flatMap((cursor: mongodb.Cursor) => {
        return Future.denodify(cursor.toArray, cursor);
      }).map((logs: any[]) => {
        assert.equal(logs.length, 1);

        assert.equal(logs[0].tag, 'test');
        assert.equal(logs[0].message, util.format(message, 1));
        assert.deepEqual(logs[0].data, DATA);
      }).nodify(done);
    });
  });
});

