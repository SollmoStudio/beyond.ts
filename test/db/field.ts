import assert = require('assert');
import Field = require('../../lib/db/field');
import Schema = require('../../lib/db/schema');
import Type = require('../../lib/db/schema/type');

describe('db.field', () => {
  describe('#integer', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.integer }, 'integerField');
      assert.equal(field.type(), Type.integer);
      assert.equal(field.name(), 'integerField');
    });
  });

  describe('#float', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.float }, 'floatField');
      assert.equal(field.type(), Type.float);
      assert.equal(field.name(), 'floatField');
    });
  });

  describe('#date', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.date }, 'dateField');
      assert.equal(field.type(), Type.date);
      assert.equal(field.name(), 'dateField');
    });
  });

  describe('#boolean', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.boolean }, 'booleanField');
      assert.equal(field.type(), Type.boolean);
      assert.equal(field.name(), 'booleanField');
    });
  });

  describe('#string', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.string }, 'stringField');
      assert.equal(field.type(), Type.string);
      assert.equal(field.name(), 'stringField');
    });
  });

  describe('#array', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.array, elementType: { type: Type.integer } }, 'arrayField');
      assert.equal(field.type(), Type.array);
      assert.equal(field.name(), 'arrayField');
    });
  });

  describe('#embedding', () => {
    it('create successfully', () => {
      let integerSchema = new Schema(1, { integerField: { type: Type.integer } });
      let field = Field.create({ type: Type.embedding, schema: integerSchema }, 'embeddingField');
      assert.equal(field.type(), Type.embedding);
      assert.equal(field.name(), 'embeddingField');
    });
  });

  describe('#objectId', () => {
    it('create successfully', () => {
      let field = Field.create({ type: Type.objectId }, 'objectIdField');
      assert.equal(field.type(), Type.objectId);
      assert.equal(field.name(), 'objectIdField');
    });
  });
});
