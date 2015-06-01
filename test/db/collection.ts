import assert = require('assert');
import Schema = require('../../lib/db/schema');
import Type = require('../../lib/db/schema/type');
import connection = require('../../lib/db/connection');
import db = require('../../lib/db');

describe('db.collection', () => {
  describe('#constructor', () => {
    it('create Collection with schema', (done: MochaDone) => {
      connection.initialize('mongodb://localhost:27017/beyondTest')
      .onSuccess(() => {
        let userSchema = new Schema(1, {
          firstName: { type: Type.string },
          lastName: { type: Type.string },
          age: { type: Type.integer }
        });
        let userCollection = new db.Collection("beyond.user", userSchema);
        assert.equal(userCollection.constructor, db.Collection);

        connection.close(true)
        .onSuccess(() => {
          done();
        }).onFailure((err: Error) => {
          done(err);
        });
      })
      .onFailure((err: Error) => {
        done(err);
      });
    });
  });
});
