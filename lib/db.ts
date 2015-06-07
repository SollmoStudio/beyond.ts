import mongodb = require('mongodb');

export const Collection = require('./db/collection');
export const Schema = require('./db/schema');
export const query = require('./db/query');

export const ASC = 1;
export const DESC = -1;

export function ObjectId(value?: string) {
  return new mongodb.ObjectID(value);
}
