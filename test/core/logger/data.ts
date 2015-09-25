import assert = require('assert');
import childProc = require('child_process');
import DataLogger = require('../../../core/logger/data');
import db = require('../../../core/db');
import fs = require('fs');
import Future = require('sfuture');
import mkdirp = require('mkdirp');
import mongodb = require('mongodb');
import path = require('path');
import rimraf = require('rimraf');
import testDB = require('../../common/db');
import util = require('util');

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

    it('Initialize with fluentd config', () => {
      const config: any = { 'log': 'fluentd:localhost:24224' };
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

    it('data logger does not save on non-configured tag.', (done: MochaDone) => {
      const message = 'log message %d';
      const DATA = 'some data string';

      let dataLogger = DataLogger.create(config);

      dataLogger(TAG + ':none', DATA, message, [ 2 ])
      .flatMap(() => {
        return Future.denodify(collection.find, collection, { });
      }).flatMap((cursor: mongodb.Cursor) => {
        return Future.denodify(cursor.toArray, cursor);
      }).map((logs: any[]) => {
        assert.equal(logs.length, 0);
      }).nodify(done);
    });
  });

  describe('logging to fluentd', () => {
    let fluentd: any;
    const logDir = path.join(__dirname, '../../log');
    const configPath = path.join(__dirname, '../../asset/fluentd.test.conf');
    const tag = 'data-logger-test';
    const config: any = {
      [tag]: 'fluentd:localhost:24224'
    };

    function getLogContent(lineCount: number, callback: (lines: string[]) => void) {
      fs.readdir(logDir, (err: Error, files: string[]) => {
        if (files.length === 0) {
          setTimeout(() => getLogContent(lineCount, callback), 10);
        } else {
          var logPath = path.join(logDir, files[0]);
          fs.readFile(logPath, (err: Error, content: Buffer) => {
            let lines = content.toString().split('\n').filter(a => !!a);
            if (lineCount === null || lines.length === lineCount) {
              callback(lines);
            } else {
              setTimeout(() => getLogContent(lineCount, callback), 10);
            }
          });
        }
      });
    }

    beforeEach((done: MochaDone) => {
      rimraf.sync(logDir);
      mkdirp.sync(logDir);
      fluentd = childProc.spawn('fluentd', ['-c', configPath]);
      fluentd.stdout.on('data', (data: Buffer) => {
        // wait until listening
        if (data.toString().indexOf('listening') >= 0) {
          done();
        }
      });
    });
    afterEach((done: MochaDone) => {
      if (fluentd.exitCode === null) {
        fluentd.on('close', () => {
          rimraf.sync(logDir);
          done();
        });
        fluentd.kill('SIGTERM');
      } else {
        done();
      }
    });

    it('data logger can save object data.', (done: MochaDone) => {
      const message = 'log message %d';
      const data = { some: 'object', is: 'saved', at: new Date().toString() };

      let dataLogger = DataLogger.create(config);

      dataLogger(tag, data, message, [ 1 ]);

      getLogContent(1, lines => {
        let res = /.+beyond\.ts\.data\.data-logger-test\s+(.+)/.exec(lines[0]);
        let logData = JSON.parse(res[1]);
        assert.deepEqual(logData.data, data);
        assert.equal(logData.message, 'log message 1');
        done();
      });
    });

    it('data logger can save string.', (done: MochaDone) => {
      const message = 'log message %d';
      const data = 'some data string';

      let dataLogger = DataLogger.create(config);

      dataLogger(tag, data, message, [ 2 ]);

      getLogContent(1, lines => {
        let res = /.+beyond\.ts\.data\.data-logger-test\s+(.+)/.exec(lines[0]);
        let logData = JSON.parse(res[1]);
        assert.equal(logData.data, data);
        assert.equal(logData.message, 'log message 2');
        done();
      });
    });

    it('does not send a log if there is no server', (done: MochaDone) => {
      const message = 'log message %d';
      const data = 'some data string';

      let dataLogger = DataLogger.create(config);

      dataLogger(tag, data, message, [ 3 ]);

      getLogContent(1, lines => {
        let res = /.+beyond\.ts\.data\.data-logger-test\s+(.+)/.exec(lines[0]);
        let logData = JSON.parse(res[1]);
        assert.equal(logData.data, data);
        assert.equal(logData.message, 'log message 3');

        fluentd.kill('SIGTERM');
        fluentd.on('close', () => {
          dataLogger(tag, data, message, [ 3 ]);

          setTimeout(() => {
            getLogContent(null, lines => {
              assert.equal(lines.length, 1);
              done();
            });
          }, 50);
        });
      });
    });
  });
});
