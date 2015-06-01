import _ = require('underscore');
import Collection = require('./collection');
import Field = require('./field');

class DbDocument {
  private _doc: any;
  private collection: Collection;
  private fields: { [name: string]: Field<any> };
  private updatedValues: { [name: string]: any };

  constructor(doc: any, collection: Collection) {
    this._doc = doc;
    this.collection = collection;
    this.fields = { };
    this.updatedValues = { };

    _.map(collection.fields, (field: Field<any>) => {
      let fieldName = field.name();
      this.fields[fieldName] = field;

      Object.defineProperty(this, fieldName, {
        enumerable: true,
        value: (value?: any) => {
          if (_.isUndefined(value)) {
            let updatedValue = this.updatedValues[fieldName];
            if (_.isUndefined(updatedValue)) {
              return this._doc[fieldName];
            }
            return updatedValue;
          } else {
            this.updatedValues[fieldName] = value;
          }
        }
      });
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
