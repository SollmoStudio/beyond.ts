import Option = require('./schema/option');

class Schema {
  private version: number;
  private fields: { [name: string]: Option };

  constructor(version: number, fields: { [name: string]: Option }) {
    this.version = version;
    this.fields = fields;
  }
}

export = Schema;
