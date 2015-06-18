import assert = require('assert');
import db = require('../../../core/db');

describe('db', () => {
  describe('#initialize', () => {
    it('initialize db with url', (done: MochaDone) => {
      db.initialize('mongodb://localhost:27017/beyondTest')
      .onComplete((err: Error) => {
        assert.ifError(err);

        db.close(true).onComplete((err: Error) => {
          assert.ifError(err);
          done();
        });
      });
    });

    it('Failed if url is wrong', (done: MochaDone) => {
      db.initialize('mongodb://localhost:2701/beyondTest')
      .onSuccess(() => {
        done(new Error('initialize must fail with wrong url'));
      }).onFailure((err: Error) => {
        assert(err);
        done();
      });
    });
  });

  describe('#close', () => {
    it('close before initialize', (done: MochaDone) => {
      db.close(true).onSuccess(() => {
        done();
      }).onFailure((err: Error) => {
        done(err);
      });
    });
  });

  describe('#connection', () => {
    it('connection is undefined if not initialized', () => {
      assert.equal(db.connection(), undefined);
    });

    it('connection is not undefined if initialized', (done: MochaDone) => {
      db.initialize('mongodb://localhost:27017/beyondTest')
      .onComplete((err: Error) => {
        assert.ifError(err);
        assert(db.connection());

        db.close(true).onComplete((err: Error) => {
          assert.ifError(err);
          done();
        });
      });
    });
  });
});
