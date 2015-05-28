import assert = require('assert');
import Schema = require('../../lib/db/schema');
import Type = require('../../lib/db/schema/type');

describe('db.Schema', () => {
  describe('#constructor', () => {
    it('Create with Option', () => {
      let UserSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer }
      });
      assert.equal(UserSchema.constructor, Schema);
    });
  });
});
