import assert = require('assert');
import connection = require('../../lib/db/connection');

describe('db', () => {
  describe('#initialize', () => {
    it('initialize db with url', (done: MochaDone) => {
      connection.initialize('mongodb://localhost:27017/beyondTest')
      .onComplete((err: Error) => {
        assert.ifError(err);

        connection.close(true).onComplete((err: Error) => {
          assert.ifError(err);
          done();
        });
      });
    });

    it('Failed if url is wrong', (done: MochaDone) => {
      connection.initialize('mongodb://localhost:2701/beyondTest')
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
      connection.close(true).onSuccess(() => {
        done();
      }).onFailure((err: Error) => {
        done(err);
      });
    });
  });

  describe('#connection', () => {
    it('connection is undefined if not initialized', () => {
      assert.equal(connection.connection(), undefined);
    });

    it('connection is not undefined if initialized', (done: MochaDone) => {
      connection.initialize('mongodb://localhost:27017/beyondTest')
      .onComplete((err: Error) => {
        assert.ifError(err);
        assert(connection.connection());

        connection.close(true).onComplete((err: Error) => {
          assert.ifError(err);
          done();
        });
      });
    });
  });
});
