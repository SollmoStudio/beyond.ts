import assert = require('assert');
import Schema = require('../../lib/db/schema');
import Type = require('../../lib/db/schema/type');
import connection = require('../../lib/db/connection');
import db = require('../../lib/db');
import util = require('./util');

describe('db.collection', () => {
  before((done: MochaDone) => {
    util.connect(done);
  });

  after((done: MochaDone) => {
    util.close(true, done);
  });

  beforeEach((done: MochaDone) => {
    let mongoConnection = connection.connection();
    mongoConnection.createCollection('beyondTestCollection', done);
  });

  afterEach((done: MochaDone) => {
    let mongoConnection = connection.connection();
    mongoConnection.dropCollection('beyondTestCollection', done);
  });

  describe('#constructor', () => {
    it('create Collection with schema', () => {
      let userSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer }
      });
      let userCollection = new db.Collection("beyondTestCollection", userSchema);
      assert.equal(userCollection.constructor, db.Collection);
    });
  });
});
