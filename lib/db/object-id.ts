import mongodb = require('mongodb');

class ObjectId {
  private oid: mongodb.ObjectID;

  constructor(id: string);
  constructor(id: mongodb.ObjectID);
  constructor(id: any = new mongodb.ObjectID()) {
    if (!(this instanceof ObjectId)) {
      return new ObjectId(id);
    }

    if (id instanceof mongodb.ObjectID) {
      this.oid = id;
    } else {
      this.oid = new mongodb.ObjectID(id);
    }
  }

  toJSON(): string {
    return `ObjectId(${this.stringify})`;
  }
  get stringify(): string {
    return this.oid.toHexString();
  }
}

export = ObjectId;
