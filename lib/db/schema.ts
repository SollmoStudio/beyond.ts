import _ = require('underscore');
import Field = require('./field');
import Option = require('./schema/option');

class Schema {
  private version: number;
  private _fields: Field<any>[];

  constructor(version: number, options: { [name: string]: Option }) {
    this.version = version;
    this._fields = _.map(options, Field.create);
  }

  get fields(): Field<any>[] {
    return this._fields;
  }
}

export = Schema;
