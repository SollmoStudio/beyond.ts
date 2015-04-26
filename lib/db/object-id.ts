import mgs = require('mongoose');

class ObjectId {
  private oid: mgs.Types.ObjectId;
  constructor(id?: string | mgs.Types.ObjectId) {
    if (!(this instanceof ObjectId)) {
      return new ObjectId(id);
    }

    if (id instanceof mgs.Types.ObjectId) {
      this.oid = id;
    } else if (typeof id === 'undefined') {
      this.oid = new mgs.Types.ObjectId();
    } else {
      this.oid = new mgs.Types.ObjectId(<string>id);
    }
  }
  toJSON(): string {
    return `ObjectId(${this.stringify})`
  }
  get stringify(): string {
    return this.oid.toHexString();
  }
}

export = ObjectId;
