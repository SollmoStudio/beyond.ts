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

  describe('#static constructor', () => {
    it('eq() creates equal operator.', () => {
      let query = Query.eq('field1', 3);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'field1': 3 });
    });

    it('ne() creates not equal operator.', () => {
      let query = Query.ne('field1', 3);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'field1': { '$ne': 3 } });
    });

    it('gt() creates greater than operator.', () => {
      let query = Query.gt('field1', 3);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'field1': { '$gt': 3 } });
    });

    it('lt() creates less than operator.', () => {
      let query = Query.lt('field1', 3);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'field1': { '$lt': 3 } });
    });

    it('gte() creates greater than or equal to operator.', () => {
      let query = Query.gte('field1', 3);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'field1': { '$gte': 3 } });
    });

    it('lte() creates less than or equal to operator.', () => {
      let query = Query.lte('field1', 3);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'field1': { '$lte': 3 } });
    });

    it('in() creates greater than or equal to operator.', () => {
      let query = Query.in('field1', [ 1, 2, 3 ]);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'field1': { '$in': [ 1, 2, 3 ] } });
    });

    it('nin() creates greater than or equal to operator.', () => {
      let query = Query.nin('field1', [ 1, 2, 3 ]);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'field1': { '$nin': [ 1, 2, 3 ] } });
    });

    it('where(str) creates query with string.', () => {
      let condition = 'obj.value > 10';
      let query = Query.where(condition);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { '$where': condition });
    });

    it('where(function) creates query with function.', () => {
      let fn = function (): boolean { return this.value > 10; };
      let query = Query.where(fn);
      assert(query.constructor === Query);
      assert(!(<any>query.query).$where.call({ value: 8 }));
      assert((<any>query.query).$where.call({ value: 15 }));
    });

    it('Query.and() creates and operation with queries', () => {
      let query1 = Query.eq('field1', 3);
      assert(query1.constructor === Query);
      assert.deepEqual(query1.query, { 'field1': 3 });

      let query2 = Query.lte('field2', 4);
      assert(query2.constructor === Query);
      assert.deepEqual(query2.query, { 'field2': { '$lte': 4 } });

      let andQuery = Query.and(query1, query2);
      assert(andQuery.constructor === Query);
      assert.deepEqual(andQuery.query, { '$and': [ { 'field1': 3 }, { 'field2': { '$lte': 4 } } ] });
    });

    it('Query.or() creates and operation with queries', () => {
      let query1 = Query.eq('field1', 3);
      assert(query1.constructor === Query);
      assert.deepEqual(query1.query, { 'field1': 3 });

      let query2 = Query.lte('field2', 4);
      assert(query2.constructor === Query);
      assert.deepEqual(query2.query, { 'field2': { '$lte': 4 } });

      let orQuery = Query.or(query1, query2);
      assert(orQuery.constructor === Query);
      assert.deepEqual(orQuery.query, { '$or': [ { 'field1': 3 }, { 'field2': { '$lte': 4 } } ] });
    });
  });
});
