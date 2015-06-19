import Future = require('sfuture');
import assert = require('assert');
import mongodb = require('mongodb');
import util = require('util');
import db = require('../../../core/db');
import MessageLogger = require('../../../core/logger/message');
import testDB = require('../../common/db');

describe('logger', () => {
  describe('#initialize', () => {
    it('#collection name cannot be empty', () => {
      const config: any = { 'log': 'mongodb:' };
      assert.throws(() => {
        MessageLogger.create(config);
      });
    });

    it('Cannot initialize with invalid option', () => {
      const config: any = { 'log': 'some other' };
      assert.throws(() => {
        MessageLogger.create(config);
      });
    });

    it('Initialize with array', () => {
      const config: any = { 'log': ['stdout', 'stderr'] };
      MessageLogger.create(config);
    });
  });

  describe('logging to mongodb', () => {
    let collection: mongodb.Collection = null;
    const mongoConfig = util.format('mongodb:%s', testDB.TestCollectionName);
    const config: any = {
      'log': mongoConfig,
      'info': mongoConfig,
      'warn': mongoConfig,
      'debug': mongoConfig,
      'error': mongoConfig
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

    it('#log', (done: MochaDone) => {
      const message = 'logging something';

      let logger = MessageLogger.create(config);

      logger('log', message)
      .flatMap(() => {
        return Future
        .denodify(collection.find, collection, { })
        .flatMap((cursor: mongodb.Cursor) => {
          return Future.denodify(cursor.toArray, cursor);
        });
      }).map((logs: any[]) => {
        assert.equal(logs.length, 1);
        assert.equal(logs[0].level, 'log');
        assert.equal(logs[0].message, message);
        assert(logs[0].date);
      }).nodify(done);
    });

    it('#logging with date', (done: MochaDone) => {
      const message1 = 'logging something';
      const message2 = 'logging another message';

      let logger = MessageLogger.create(config);

      logger('log', message1)
      .flatMap(() => {
        return logger('info', message2);
      }).flatMap(() => {
        return Future
        .denodify(collection.find, collection, { }, { 'sort': { 'date': 1 } })
        .flatMap((cursor: mongodb.Cursor) => {
          return Future.denodify(cursor.toArray, cursor);
        });
      }).map((logs: any[]) => {
        assert.equal(logs.length, 2);

        assert.equal(logs[0].level, 'log');
        assert.equal(logs[0].message, message1);
        assert(logs[0].date);

        assert.equal(logs[1].level, 'info');
        assert.equal(logs[1].message, message2);
        assert(logs[1].date);
      }).nodify(done);
    });

    it('#info', (done: MochaDone) => {
      const message = 'logging something';

      let logger = MessageLogger.create(config);

      logger('info', message)
      .flatMap(() => {
        return Future
        .denodify(collection.find, collection, { })
        .flatMap((cursor: mongodb.Cursor) => {
          return Future.denodify(cursor.toArray, cursor);
        });
      }).map((logs: any[]) => {
        assert.equal(logs.length, 1);
        assert.equal(logs[0].level, 'info');
        assert.equal(logs[0].message, message);
        assert(logs[0].date);
      }).nodify(done);
    });

    it('#warn', (done: MochaDone) => {
      const message = 'logging something';

      let logger = MessageLogger.create(config);

      logger('warn', message)
      .flatMap(() => {
        return Future
        .denodify(collection.find, collection, { })
        .flatMap((cursor: mongodb.Cursor) => {
          return Future.denodify(cursor.toArray, cursor);
        });
      }).map((logs: any[]) => {
        assert.equal(logs.length, 1);
        assert.equal(logs[0].level, 'warn');
        assert.equal(logs[0].message, message);
        assert(logs[0].date);
      }).nodify(done);
    });

    it('#debug', (done: MochaDone) => {
      const message = 'logging something';

      let logger = MessageLogger.create(config);

      logger('debug', message)
      .flatMap(() => {
        return Future
        .denodify(collection.find, collection, { })
        .flatMap((cursor: mongodb.Cursor) => {
          return Future.denodify(cursor.toArray, cursor);
        });
      }).map((logs: any[]) => {
        assert.equal(logs.length, 1);
        assert.equal(logs[0].level, 'debug');
        assert.equal(logs[0].message, message);
        assert(logs[0].date);
      }).nodify(done);
    });

    it('#error', (done: MochaDone) => {
      const message = 'logging something';

      let logger = MessageLogger.create(config);

      logger('error', message)
      .flatMap(() => {
        return Future
        .denodify(collection.find, collection, { })
        .flatMap((cursor: mongodb.Cursor) => {
          return Future.denodify(cursor.toArray, cursor);
        });
      }).map((logs: any[]) => {
        assert.equal(logs.length, 1);
        assert.equal(logs[0].level, 'error');
        assert.equal(logs[0].message, message);
        assert(logs[0].date);
      }).nodify(done);
    });
  });
});
