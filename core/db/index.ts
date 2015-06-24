import _ = require('underscore');

interface IFields {
  [name: string]: number|string;
}

interface IOption {
  unique?: boolean;
  sparse?: boolean;
  name?: string;
}

class Index {
  private _fields: IFields;
  private _option: IOption;

  constructor(fields: IFields, option: { unique?: boolean, sparse?: boolean, name?: string } = {}) {
    this._fields = fields;
    this._option = _.defaults(option, { unique: false, sparse: false });
  }

  get key(): IFields {
    return _.clone(this._fields);
  }
}

export = Index;
