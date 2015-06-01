import Future = require('sfuture');
import assert = require('assert');
import mongodb = require('mongodb');
import Query = require('../../lib/db/query');
import connection = require('../../lib/db/connection');
import util = require('./util');

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

  describe('#method', () => {
    it('eq metohd reutrn new query with eq operation added.', () => {
      let rawQuery = { team: 'SollmoStudio' };
      let teamQuery = new Query(rawQuery);
      assert(teamQuery.constructor === Query);
      assert.deepEqual(teamQuery.query, rawQuery);

      let query = teamQuery.eq('email', 'ex@mple.com');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { '$and': [ rawQuery, { 'email': 'ex@mple.com' } ] });
    });

    it('ne metohd reutrn new query with eq operation added.', () => {
      let rawQuery = { team: 'SollmoStudio' };
      let teamQuery = new Query(rawQuery);
      assert(teamQuery.constructor === Query);
      assert.deepEqual(teamQuery.query, rawQuery);

      let query = teamQuery.ne('email', 'ex@mple.com');
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { '$and': [ rawQuery, { 'email': { '$ne': 'ex@mple.com' } } ] });
    });

    it('gt metohd reutrn new query with eq operation added.', () => {
      let rawQuery = { team: 'SollmoStudio' };
      let teamQuery = new Query(rawQuery);
      assert(teamQuery.constructor === Query);
      assert.deepEqual(teamQuery.query, rawQuery);

      let query = teamQuery.gt('score', 100);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { '$and': [ rawQuery, { 'score': { '$gt': 100 } } ] });
    });

    it('lt metohd reutrn new query with eq operation added.', () => {
      let rawQuery = { team: 'SollmoStudio' };
      let teamQuery = new Query(rawQuery);
      assert(teamQuery.constructor === Query);
      assert.deepEqual(teamQuery.query, rawQuery);

      let query = teamQuery.lt('score', 100);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { '$and': [ rawQuery, { 'score': { '$lt': 100 } } ] });
    });

    it('gte metohd reutrn new query with eq operation added.', () => {
      let rawQuery = { team: 'SollmoStudio' };
      let teamQuery = new Query(rawQuery);
      assert(teamQuery.constructor === Query);
      assert.deepEqual(teamQuery.query, rawQuery);

      let query = teamQuery.gte('score', 100);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { '$and': [ rawQuery, { 'score': { '$gte': 100 } } ] });
    });

    it('lte metohd reutrn new query with eq operation added.', () => {
      let rawQuery = { team: 'SollmoStudio' };
      let teamQuery = new Query(rawQuery);
      assert(teamQuery.constructor === Query);
      assert.deepEqual(teamQuery.query, rawQuery);

      let query = teamQuery.lte('score', 100);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { '$and': [ rawQuery, { 'score': { '$lte': 100 } } ] });
    });

    it('in metohd reutrn new query with eq operation added.', () => {
      let rawQuery = { team: 'SollmoStudio' };
      let teamQuery = new Query(rawQuery);
      assert(teamQuery.constructor === Query);
      assert.deepEqual(teamQuery.query, rawQuery);

      let query = teamQuery.in('score', [ 70, 84, 100 ]);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { '$and': [ rawQuery, { 'score': { '$in': [ 70, 84, 100 ] } } ] });
    });

    it('lte metohd reutrn new query with eq operation added.', () => {
      let rawQuery = { team: 'SollmoStudio' };
      let teamQuery = new Query(rawQuery);
      assert(teamQuery.constructor === Query);
      assert.deepEqual(teamQuery.query, rawQuery);

      let query = teamQuery.nin('score', [ 70, 84, 100 ]);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { '$and': [ rawQuery, { 'score': { '$nin': [ 70, 84, 100 ] } } ] });
    });

    it('where metohd reutrn new query with eq operation added.', () => {
      let rawQuery = { team: 'SollmoStudio' };
      let teamQuery = new Query(rawQuery);
      assert(teamQuery.constructor === Query);
      assert.deepEqual(teamQuery.query, rawQuery);

      let condition = 'obj.firstName === "Kim"';
      let query = teamQuery.where(condition);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { '$and': [ rawQuery, { '$where': condition } ] });
    });

    it('Query.and() creates and operation with queries', () => {
      let query0 = Query.eq('field0', 'value');
      assert(query0.constructor === Query);
      assert.deepEqual(query0.query, { 'field0': 'value' });

      let query1 = Query.eq('field1', 3);
      assert(query1.constructor === Query);
      assert.deepEqual(query1.query, { 'field1': 3 });

      let query2 = Query.lte('field2', 4);
      assert(query2.constructor === Query);
      assert.deepEqual(query2.query, { 'field2': { '$lte': 4 } });

      let andQuery = query0.and(query1, query2);
      assert(andQuery.constructor === Query);
      assert.deepEqual(andQuery.query, { '$and': [ query0.query, query1.query, query2.query ] });
    });

    it('Query.or() creates and operation with queries', () => {
      let query0 = Query.eq('field0', 'value');
      assert(query0.constructor === Query);
      assert.deepEqual(query0.query, { 'field0': 'value' });

      let query1 = Query.eq('field1', 3);
      assert(query1.constructor === Query);
      assert.deepEqual(query1.query, { 'field1': 3 });

      let query2 = Query.lte('field2', 4);
      assert(query2.constructor === Query);
      assert.deepEqual(query2.query, { 'field2': { '$lte': 4 } });

      let orQuery = query0.or(query1, query2);
      assert(orQuery.constructor === Query);
      assert.deepEqual(orQuery.query, { '$or': [ query0.query, query1.query, query2.query ] });
    });
  });

  describe('Really quering to mongodb', () => {
    let doc0 = { a: 1, b: 3 };
    let doc1 = { a: 1, b: 2 };
    let documents = [
      doc0, doc1
    ];

    let collection: mongodb.Collection = undefined;

    before((done: MochaDone) => {
      Future.denodify<void>(util.connect, util)
      .map(() => {
        let mongoConnection = connection.connection();
        collection = mongoConnection.collection('beyondTestCollection');
      }).flatMap(() => {
        return Future.denodify<void>(collection.remove, collection, { });
      }).flatMap(() => {
        return Future.denodify<void>(collection.insert, collection, documents);
      }).nodify(done);
    });

    after((done: MochaDone) => {
      let mongoConnection = connection.connection();
      Future.denodify(mongoConnection.dropCollection, mongoConnection, 'beyondTestCollection')
      .flatMap(() => {
        return Future.denodify(util.close, util);
      }).nodify(done);
    });

    it('eq query', (done: MochaDone) => {
      let query = Query.eq('b', 2);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'b': 2 });

      let cursor = collection.find(query.query);
      Future.denodify(cursor.toArray, cursor)
      .map((docs: any[]) => {
        assert.equal(docs.length, 1);
        assert.equal(JSON.stringify(docs[0]), JSON.stringify(doc1));
      }).nodify(done);
    });

    it('ne query', (done: MochaDone) => {
      let query = Query.ne('b', 3);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'b': { '$ne': 3 } });

      let cursor = collection.find(query.query);
      Future.denodify(cursor.toArray, cursor)
      .map((docs: any[]) => {
        assert.equal(docs.length, 1);
        assert.equal(JSON.stringify(docs[0]), JSON.stringify(doc1));
      }).nodify(done);
    });

    it('in query', (done: MochaDone) => {
      let query = Query.in('b', [ 2, 3 ]);
      assert(query.constructor === Query);
      assert.deepEqual(query.query, { 'b': { '$in': [ 2, 3 ] } });

      let cursor = collection.find(query.query).sort({ b: 1 });
      Future.denodify(cursor.toArray, cursor)
      .map((docs: any[]) => {
        assert.equal(docs.length, 2);
        assert.equal(JSON.stringify(docs[0]), JSON.stringify(doc1));
        assert.equal(JSON.stringify(docs[1]), JSON.stringify(doc0));
      }).nodify(done);
    });

    it('and method', (done: MochaDone) => {
      let query1 = Query.eq('a', 1);
      assert(query1.constructor === Query);
      assert.deepEqual(query1.query, { 'a': 1 });

      let query2 = Query.ne('b', 2);
      assert(query2.constructor === Query);
      assert.deepEqual(query2.query, { 'b': { '$ne': 2 } });

      let query = query1.and(query2);

      let cursor = collection.find(query.query);
      Future.denodify(cursor.toArray, cursor)
      .map((docs: any[]) => {
        assert.equal(docs.length, 1);
        assert.equal(JSON.stringify(doc0), JSON.stringify(docs[0]));
      }).nodify(done);
    });
  });
});
