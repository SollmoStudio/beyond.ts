import Future = require('sfuture');
import _ = require('underscore');
import mongodb = require('mongodb');
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

  insert (document: any): Future<any> {
    // TODO: validation with schema.
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

  find(query: Query): Future<Document[]> {
    let cursor = this.collection.find(query);
    return Future.denodify(cursor.toArray, cursor);
  }

  findOne(query: Query): Future<Document> {
    let collection = this.collection;
    return Future.denodify(collection.findOne, collection, query.query);
  }

  get fields(): Field<any>[] {
    return this._fields;
  }
}

export = Collection;
