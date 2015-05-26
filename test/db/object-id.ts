import assert = require('assert');
import db = require('../../lib/db');

describe('db.ObjectId', function () {
  describe('ObjectId', function () {
    it('returns a random ObjectId object.', function () {
      var oid = db.ObjectId();
      assert.equal(oid.constructor === db.ObjectId, true);
    });

    it('returns a specific ObjectId object.', function () {
      var oid = db.ObjectId("54073619521b5fd89c9cc68a");
      assert.equal(oid.constructor === db.ObjectId, true);
    });

    it('throws an error if input is not valid.', function () {
      assert.throws(() => {
        db.ObjectId("540736");
      }, Error);
    });
  });

  describe('constructor', function () {
    it('returns a random ObjectId object.', function () {
      var oid = new db.ObjectId();
      assert.equal(oid.constructor === db.ObjectId, true);
    });

    it('returns a specific ObjectId object.', function () {
      var oid = new db.ObjectId("54073619521b5fd89c9cc68a");
      assert.equal(oid.constructor === db.ObjectId, true);
    });

    it('throws an error if input is not valid.', function () {
      assert.throws(() => {
        return new db.ObjectId("540736");
      }, Error);
    });
  });

  describe('#toJSON()', function () {
    it('returns a JSON-ed ObjectId string.', function () {
      var oid = new db.ObjectId("54073619521b5fd89c9cc68a");
      assert.equal(oid.toJSON(), 'ObjectId(54073619521b5fd89c9cc68a)');
    });
  });

  describe('#stringify', function () {
    it('returns a ObjectId string.', function () {
      var oid = new db.ObjectId("54073619521b5fd89c9cc68a");
      assert.equal(oid.stringify, '54073619521b5fd89c9cc68a');
    });
  });
});
