import Future = require('sfuture');
import _ = require('underscore');
import mongodb = require('mongodb');
import Collection = require('./collection');
import Field = require('./field');

class DbDocument {
  private _doc: any;
  private collection: Collection;
  private fields: { [name: string]: Field<any> };
  private _changedValues: { [name: string]: any };

  constructor(doc: any, collection: Collection) {
    this._doc = doc;
    this.collection = collection;
    this.fields = { };
    this._changedValues = { };

    _.map(collection.fields, (field: Field<any>) => {
      let fieldName = field.name();
      this.fields[fieldName] = field;

      Object.defineProperty(this, fieldName, {
        enumerable: true,
        value: (value?: any) => {
          if (_.isUndefined(value)) {
            let changedValue = this._changedValues[fieldName];
            if (_.isUndefined(changedValue)) {
              return this._doc[fieldName];
            }
            return changedValue;
          } else {
            this._changedValues[fieldName] = value;
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
    let changedValues = _.clone(this._changedValues);
    return _.defaults(changedValues, this._doc);
  }

  get body(): any {
    return _.omit(this.doc, '_id');
  }

  changedValues(): any {
    return _.omit(this._changedValues, '_id');
  }

  toJSON(): any {
    return this.doc;
  }

  save(): Future<DbDocument> {
    return this.collection.save(this);
  }

  remove(): Future<any> {
    return this.collection.removeOne(this);
  }
}

export = DbDocument;
