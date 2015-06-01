import _ = require('underscore');
import Collection = require('./collection');
import Field = require('./field');

class DbDocument {
  private _doc: any;
  private collection: Collection;
  private fields: { [name: string]: Field<any> };

  constructor(doc: any, collection: Collection) {
    this._doc = doc;
    this.collection = collection;

    _.map(collection.fields, (field: Field<any>) => {
      this.fields[field.name()] = field;
    });
  }

  get objectId(): string {
    return <any>(this._doc)._id.toHexString();
  }

  toJSON(): any {
    return this._doc;
  }
}

export = DbDocument;
