import _ = require('underscore');
import Field = require('./field');
import Schema = require('./schema');

class Collection {
  private name: string;
  private fields: Field<any>[];

  constructor(name: string, schema: Schema, option?: any) {
    this.name = name;
    this.fields = schema.fields;

    if (!_.isUndefined(option)) {
      console.warn('You use option argument of collection(%s), option argument of Collection constructor is not implemented yet.', name);
    }
  }
}

export = Collection;
