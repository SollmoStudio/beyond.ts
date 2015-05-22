import assert = require('assert');
import Query = require('../../lib/db/query');

describe('db.Query', () => {
  describe('#constructor', () => {
    it('create query without input.', () => {
      let emptyQuery = new Query();
      assert(emptyQuery.constructor === Query);
      assert.deepEqual(emptyQuery.query, { });
    });

    it('create query with object.', () => {
      let rawQuery = { team: 'SollmoStudio' };
      let query = new Query(rawQuery);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, rawQuery);
    });
  });
});
