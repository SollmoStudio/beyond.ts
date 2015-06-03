import _ = require('underscore');
import mongodb = require('mongodb');
import Collection = require('./collection');
import Field = require('./field');

class DbDocument {
  private _doc: any;
  private collection: Collection;
  private fields: { [name: string]: Field<any> };
  private _updatedValues: { [name: string]: any };

  constructor(doc: any, collection: Collection) {
    this._doc = doc;
    this.collection = collection;
    this.fields = { };
    this._updatedValues = { };

    _.map(collection.fields, (field: Field<any>) => {
      let fieldName = field.name();
      this.fields[fieldName] = field;

      Object.defineProperty(this, fieldName, {
        enumerable: true,
        value: (value?: any) => {
          if (_.isUndefined(value)) {
            let updatedValue = this._updatedValues[fieldName];
            if (_.isUndefined(updatedValue)) {
              return this._doc[fieldName];
            }
            return updatedValue;
          } else {
            this._updatedValues[fieldName] = value;
          }
        }
      });
    });
  }

  get _id(): mongodb.ObjectID {
    return (this._doc)._id;
  }

  get objectId(): string {
    return this._id.toHexString();
  }

  get doc(): any {
    let updatedValues = _.clone(this._updatedValues);
    return _.defaults(updatedValues, this._doc);
  }

  get body(): any {
    return _.omit(this.doc, '_id');
  }

  updatedValues(): any {
    return _.omit(this._updatedValues, '_id');
  }

  toJSON(): any {
    return this.doc;
  }
}

export = DbDocument;
