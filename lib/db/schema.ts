import _ = require('underscore');
import Field = require('./field');
import Option = require('./schema/option');

class Schema {
  private version: number;
  private fields: Field<any>[];

  constructor(version: number, fields: { [name: string]: Option }) {
    this.version = version;
    this.fields = _.map(fields, Field.create);
  }
}

export = Schema;
