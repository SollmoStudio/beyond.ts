import Future = require('sfuture');
import _ = require('underscore');
import mongodb = require('mongodb');
import Field = require('./field');
import Schema = require('./schema');
import connection = require('./connection');

class Collection {
  private name: string;
  private fields: Field<any>[];
  private collection: mongodb.Collection;

  constructor(name: string, schema: Schema, option?: any) {
    this.name = name;
    this.fields = schema.fields;

    if (!_.isUndefined(option)) {
      console.warn('You use option argument of collection(%s), option argument of Collection constructor is not implemented yet.', name);
    }

    this.collection = connection.connection().collection(name);
  }

  insert (document: any): Future<any> {
    // TODO: validation with schema.
    return Future.denodify(this.collection.insert, this.collection, document);
  }
}

export = Collection;
