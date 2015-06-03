import db = require('../../lib/db');

export function connect(done: MochaDone) {
  db.initialize('mongodb://localhost:27017/beyondTest')
  .nodify(done);
}

export function close(forceClose: boolean, done: MochaDone) {
  db.close(forceClose)
  .nodify(done);
}
