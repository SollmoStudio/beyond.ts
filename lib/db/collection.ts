import _ = require('underscore');
import Schema = require('./schema');

class Collection {
  private name: string;
  private schema: Schema;

  constructor(name: string, schema: Schema, option?: any) {
    this.name = name;
    this.schema = schema;

    if (!_.isUndefined(option)) {
      console.warn('You use option argument of collection(%s), option argument of Collection constructor is not implemented yet.', name);
    }
  }
}

export = Collection;
