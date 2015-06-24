import Future = require('sfuture');
import _ = require('underscore');
import assert = require('assert');
import mongodb = require('mongodb');
import util = require('util');
import Document = require('./document');
import Field = require('./field');
import Index = require('./index');
import Query = require('./query');
import Schema = require('./schema');
import db = require('../../core/db');

class Collection {
  private name: string;
  private _fields: { [name: string]: Field<any> };
  private collection: mongodb.Collection;
  private indices: Index[];

  constructor(name: string, schema: Schema, option: { indices?: Index[]; validations?: any[] } = {}) {
    this.name = name;
    this._fields = {};
    _.map(schema.fields, <T>(field: Field<T>) => {
      this._fields[field.name()] = field;
    });

    if (_.isArray(option.indices)) {
      this.indices = option.indices;
    }

    /* istanbul ignore next */
    if (!_.isUndefined(option.validations)) {
      console.warn('You use validation option of collection(%s), but validation of Collection constructor is not implemented yet.', name);
    }

    this.collection = db.connection().collection(name);
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

  save(document: Document): Future<Document> {
    let changed = document.changedValues();
    if (_.isEmpty(changed)) {
      return Future.successful(this.newDocument(document.doc));
    }

    return this.getOrError(changed)
    .flatMap((changed: any) => {
      let selector = { '_id': document._id };
      let query = { '$set': changed };
      return this.updateInternal(selector, query);
    }).map((res: any) => {
      let result = res.result;
      if (result.ok === 1 && result.n === 1) {
        return this.newDocument(document.doc);
      }
      let err: any = new Error(util.format('Cannot save %j (status: %j)', changed, result));
      err.result = result;
      throw err;
    });
  }

  // CAUTION: This methods does not validates.
  update(query: Query, update: any): Future<any> {
    return this.updateInternal(query.query, update);
  }

  set(query: Query, changed: any): Future<Document> {
    if (_.isEmpty(changed)) {
      return Future.successful(null);
    }

    return this.getOrError(changed)
    .flatMap((changed: any) => {
      return this.update(query, { '$set': changed });
    });
  }

  get fields(): { [name: string]: Field<any> } {
    return this._fields;
  }

  drop(): Future<void> {
    let collection = this.collection;
    return Future.denodify<void>(collection.drop, collection)
    .recover(() => { return; });
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
      assert(_.isObject(document), util.format('cannot save %j', document));

      return this.getOrError(document)
      .flatMap((document: any) => {
        if (_.isUndefined(document._id)) {
          document._id = new mongodb.ObjectID();
        }
        return Future.denodify(this.collection.insert, this.collection, document)
        .map(() => {
          return this.newDocument(document);
        });
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
    return Future.sequence(futures);
  }

  private newDocument(document: any): Document {
    if (document === null) {
      return null;
    }

    return new Document(document, this);
  }

  private getOrError(document: any): Future<any> {
    return this.returnFailedFutureOnError(() => {
      let result: any = { };
      _.map(_.omit(document, '_id'), (value: any, name: string) => {
        result[name] = this._fields[name].getOrError(value);
      });

      if (!_.isUndefined(document._id)) {
        result._id = document._id;
      }

      return Future.successful(result);
    });
  }

  private updateInternal(query: any, update: any): Future<any> {
    let collection = this.collection;
    return Future.denodify(collection.update, collection, query, update);
  }
}

export = Collection;
