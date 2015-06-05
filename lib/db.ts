import mongodb = require('mongodb');

export const Collection = require('./db/collection');

export const ASC = 1;
export const DESC = -1;

export function ObjectId(value?: string) {
  return new mongodb.ObjectID(value);
}
