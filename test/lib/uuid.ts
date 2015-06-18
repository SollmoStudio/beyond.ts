import assert = require('assert');
import uuid = require('../../lib/uuid');

describe('uuid', function () {
  describe('#v1()', function () {
    it('returns a time-based uuid.', function () {
      let id = uuid.v1();
      let idRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
      assert.equal(!!idRegex.exec(id), true);
    });

    it('returns a uuid generated with a node.', function () {
      let id = uuid.v1({node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab]});
      let idRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-0123456789ab$/;
      assert.equal(!!idRegex.exec(id), true);
    });

    it('returns a uuid generated with time options.', function () {
      let id = uuid.v1({
        clockseq: 0x1234,
        msecs: new Date('2014-01-01').getTime(),
        nsecs: 5678
      });
      let idRegex = /^a835962e-7277-11e3-9234-[0-9a-f]{12}$/;
      assert.equal(!!idRegex.exec(id), true);
    });

    it('returns a uuid generated with all options.', function () {
      let id = uuid.v1({
        node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
        clockseq: 0x1234,
        msecs: new Date('2014-01-01').getTime(),
        nsecs: 5678
      });
      let expected = 'a835962e-7277-11e3-9234-0123456789ab';
      assert.equal(id, expected);
    });
  });

  describe('#v4()', function () {
    it('returns a randomized uuid.', function () {
      let id = uuid.v4();
      let idRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
      assert.equal(!!idRegex.exec(id), true);
    });
  });
});
