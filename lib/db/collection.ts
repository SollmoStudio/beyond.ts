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
import db = require('../db');

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
    return this.insertInternal(...docs);
  }

  remove(query: Query): Future<any> {
    return this.returnFailedFutureOnError(() => {
      return Future.denodify(this.collection.remove, this.collection, query.query);
    });
  }

  removeOne(query: Query): Future<any>;
  removeOne(doc: Document): Future<any>;
  removeOne(target: any): Future<any> {
    return this.returnFailedFutureOnError(() => {
      let query: any;
      if (target instanceof Query) {
        query = target.query;
      } else {
        query = { '_id': target._id };
      }

      return Future.denodify(this.collection.remove, this.collection, query, { single: true });
    });
  }

  find(query: Query, option: mongodb.CollectionFindOptions = { }): Future<Document[]> {
    return this.returnFailedFutureOnError(() => {
      assert(_.isObject(option));

      let cursor = this.collection.find(query.query, option);

      return Future.denodify(cursor.toArray, cursor)
      .map((docs: any[]) => {
        return _.map(docs, (doc: any) => {
          if (doc === null) {
            return null;
          }

          return this.newDocument(doc);
        });
      });
    });
  }

  findOne(query: Query): Future<Document> {
    return this.returnFailedFutureOnError(() => {
      let collection = this.collection;
      return Future.denodify(collection.findOne, collection, query.query)
      .map((doc: any) => {
        if (doc === null) {
          return null;
        }

        return this.newDocument(doc);
      });
    });
  }

  findOneAndRemove(query: Query, sort: { [name: string]: number } = { }): Future<Document> {
    return this.returnFailedFutureOnError(() => {
      let collection = this.collection;

      return Future.denodify(collection.findAndRemove, collection, query.query, sort)
      .map((result: any) => {
        let doc = result.value;
        if (doc === null) {
          return null;
        }

        return this.newDocument(doc);
      });
    });
  }

  count(query: Query): Future<number> {
    return this.returnFailedFutureOnError(() => {
      let collection = this.collection;
      return Future.denodify(collection.count, collection, query.query);
    });
  }

  get fields(): Field<any>[] {
    return this._fields;
  }

  private returnFailedFutureOnError<T>(fn: () => Future<T>) {
    try {
      return fn();
    } catch (ex) {
      return Future.failed(ex);
    }
  }

  private insertOne(document: any): Future<any> {
    return this.returnFailedFutureOnError<any>(() => {
      if (_.isUndefined(document._id)) {
        document._id = db.ObjectId();
      }

      assert(_.isObject(document), util.format('cannot save %j', document));

      // TODO: validation with schema.
      return Future.denodify(this.collection.insert, this.collection, document)
      .map(() => {
        return this.newDocument(document);
      });
    });
  }

  private insertInternal(...docs: any[]): Future<any> {
    if (docs.length === 0) {
      return Future.successful([]);
    }

    if (docs.length === 1) {
      return this.insertOne(docs[0]);
    }

    let futures: Future<any>[] = _.map(docs, (doc: any): Future<any> => {
      return this.insertOne(doc);
    });
    return Future.sequence(...futures);
  }

  private newDocument(document: any): Document {
    if (document === null) {
      return null;
    }

    return new Document(document, this);
  }
}

export = Collection;
