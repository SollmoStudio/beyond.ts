import assert = require('assert');
import childProc = require('child_process');
import db = require('../../../core/db');
import fs = require('fs');
import Future = require('sfuture');
import MessageLogger = require('../../../core/logger/message');
import mkdirp = require('mkdirp');
import mongodb = require('mongodb');
import path = require('path');
import rimraf = require('rimraf');
import testDB = require('../../common/db');
import util = require('util');

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

    it('Initialize with fluentd config', () => {
      const config: any = { 'log': 'fluentd:localhost:24224' };
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

  describe('logging to fluentd', () => {
    let fluentd: any;
    const logDir = path.join(__dirname, '../../log');
    const configPath = path.join(__dirname, '../../asset/fluentd.test.conf');
    const config: any = {
      'log': 'fluentd:localhost:24224',
      'info': 'fluentd:localhost:24224',
      'warn': 'fluentd:localhost:24224',
      'debug': 'fluentd:localhost:24224',
      'error': 'fluentd:localhost:24224'
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

    it('#log', (done: MochaDone) => {
      const message = 'logging something';

      let logger = MessageLogger.create(config);
      logger('log', message);

      getLogContent(1, lines => {
        assert.ok(/beyond.ts.log[\s]+"logging something"/.test(lines[0]));
        done();
      });
    });

    it('#info', (done: MochaDone) => {
      const message = 'logging something';

      let logger = MessageLogger.create(config);
      logger('info', message);

      getLogContent(1, lines => {
        assert.ok(/beyond.ts.info[\s]+"logging something"/.test(lines[0]));
        done();
      });
    });

    it('#log and #info several logs', (done: MochaDone) => {
      const message1 = 'logging something';
      const message2 = 'logging another message';

      let logger = MessageLogger.create(config);

      logger('log', message1)
      .flatMap(() => {
        return logger('info', message2);
      });

      getLogContent(2, lines => {
        assert.ok(/beyond.ts.log[\s]+"logging something"/.test(lines[0]));
        assert.ok(/beyond.ts.info[\s]+"logging another message"/.test(lines[1]));
        done();
      });
    });

    it('#warn', (done: MochaDone) => {
      const message = 'logging something';

      let logger = MessageLogger.create(config);
      logger('warn', message);

      getLogContent(1, lines => {
        assert.ok(/beyond.ts.warn[\s]+"logging something"/.test(lines[0]));
        done();
      });
    });

    it('#debug', (done: MochaDone) => {
      const message = 'logging something';

      let logger = MessageLogger.create(config);
      logger('debug', message);

      getLogContent(1, lines => {
        assert.ok(/beyond.ts.debug[\s]+"logging something"/.test(lines[0]));
        done();
      });
    });

    it('#error', (done: MochaDone) => {
      const message = 'logging something';

      let logger = MessageLogger.create(config);
      logger('error', message);

      getLogContent(1, lines => {
        assert.ok(/beyond.ts.error[\s]+"logging something"/.test(lines[0]));
        done();
      });
    });

    it('does not send a log if there is no server', (done: MochaDone) => {
      const message = 'logging something';

      let logger = MessageLogger.create(config);

      logger('log', message);

      getLogContent(1, lines => {
        assert.ok(/beyond.ts.log[\s]+"logging something"/.test(lines[0]));

        fluentd.kill('SIGTERM');
        fluentd.on('close', () => {
          logger('log', message);

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
