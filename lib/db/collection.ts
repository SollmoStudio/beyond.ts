import Future = require('sfuture');
import _ = require('underscore');
import assert = require('assert');
import mongodb = require('mongodb');
import util = require('util');
import Document = require('./document');
import Field = require('./field');
import Query = require('./query');
import Schema = require('./schema');
import connection = require('./connection');

class Collection {
  private name: string;
  private _fields: Field<any>[];
  private collection: mongodb.Collection;

  constructor(name: string, schema: Schema, option?: any) {
    this.name = name;
    this._fields = schema.fields;

    if (!_.isUndefined(option)) {
      console.warn('You use option argument of collection(%s), option argument of Collection constructor is not implemented yet.', name);
    }

    this.collection = connection.connection().collection(name);
  }

  insert(...docs: any[]): Future<any> {
    // TODO: validation with schema.
    if (docs.length > 1) {
      let futures: Future<any>[] = _.map(docs, (doc: any): Future<any> => {
        return this.insert(doc);
      });
      return Future.sequence(...futures);
    }

    let document = docs[0];
    assert(!_.isArray(document), util.format('%j is not document.', document));
    return Future.denodify(this.collection.insert, this.collection, document);
  }

  remove(query: Query): Future<any> {
    return Future.denodify(this.collection.remove, this.collection, query.query);
  }

  removeOne(query: Query): Future<any>;
  removeOne(doc: Document): Future<any>;
  removeOne(target: any): Future<any> {
    let query: any;
    if (target instanceof Query) {
      query = target.query;
    } else {
      query = { '_id': target._id };
    }

    return Future.denodify(this.collection.remove, this.collection, query, { single: true });
  }

  find(query: Query, option: mongodb.CollectionFindOptions = { }): Future<Document[]> {
    assert(_.isObject(option));

    let cursor = this.collection.find(query, option);

    return Future.denodify(cursor.toArray, cursor);
  }

  findOne(query: Query): Future<Document> {
    let collection = this.collection;
    return Future.denodify(collection.findOne, collection, query.query);
  }

  count(query: Query): Future<number> {
    let collection = this.collection;
    return Future.denodify(collection.count, collection, query.query);
  }

  get fields(): Field<any>[] {
    return this._fields;
  }
}

export = Collection;
