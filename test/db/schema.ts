import assert = require('assert');
import Schema = require('../../lib/db/schema');
import Type = require('../../lib/db/schema/type');

// To pass tslint: unused variable
function handleUnused(value: any) {
  return;
}

describe('db.Schema', () => {
  describe('#constructor', () => {
    it('Create with Option', () => {
      let UserSchema = new Schema(1, {
        firstName: { type: Type.string },
        lastName: { type: Type.string },
        age: { type: Type.integer }
      });
      assert.equal(UserSchema.constructor, Schema);
    });

    describe('#validate default value', () => {
      it('default value of the integer type has to be integer', () => {
        assert.throws(
          () => {
            let integerSchema = new Schema(1, { integerField: { type: Type.integer, default: 3.4 } });
            handleUnused(integerSchema);
          },
          (err: Error) => {
            return (err instanceof Error) && err.message === 'default value of integerField(3.4) is not integer.';
          }
        );
      });

      it('default value of the float type has to be float', () => {
        assert.throws(
          () => {
            let floatSchema = new Schema(1, { floatField: { type: Type.float, default: "not float" } });
            handleUnused(floatSchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'default value of floatField("not float") is not float.';
          }
        );
      });

      it('default value of the string type has to be string', () => {
        assert.throws(
          () => {
            let stringSchema = new Schema(1, { stringField: { type: Type.string, default: true } });
            handleUnused(stringSchema);
          },
          (err: Error) => {
            return (err instanceof Error) && err.message === 'default value of stringField(true) is not string.';
          }
        );
      });

      it('default value of the boolean type has to be boolean', () => {
        assert.throws(
          () => {
            let booleanSchema = new Schema(1, { booleanField: { type: Type.boolean, default: "true" } });
            handleUnused(booleanSchema);
          },
          (err: Error) => {
            return (err instanceof Error) && err.message === 'default value of booleanField("true") is not boolean.';
          }
        );
      });

      it('default value of the date type has to be date', () => {
        assert.throws(
          () => {
            let dateSchema = new Schema(1, { dateField: { type: Type.date, default: "2015-05-29 01:41:43" } });
            handleUnused(dateSchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'default value of dateField("2015-05-29 01:41:43") is not date.';
          }
        );
      });

      it('default value of the array type has to be array', () => {
        assert.throws(
          () => {
            let arraySchema = new Schema(1, { arrayField: { type: Type.array, default: 5 } });
            handleUnused(arraySchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'default value of arrayField(5) is not array.';
          }
        );
      });

      it('default value of the objectId type has to be ObjectId', () => {
        assert.throws(
          () => {
            let objectIdSchema = new Schema(1, { objectIdField: { type: Type.objectId, default: "1234567890abcd1234567890" } });
            handleUnused(objectIdSchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'default value of objectIdField("1234567890abcd1234567890") is not objectId.';
          }
        );
      });


      it('success to create schema when the default type is correct', () => {
        let integerSchema = new Schema(1, { integerField: { type: Type.integer, default: 3 } });
        let floatSchema = new Schema(1, { floatField: { type: Type.float, default: 3.5 } });
        let stringSchema = new Schema(1, { stringField: { type: Type.string, default: "some value" } });
        let booleanSchema = new Schema(1, { booleanField: { type: Type.boolean, default: true } });
        let dateSchema = new Schema(1, { dateField: { type: Type.date, default: new Date("2015-05-29 01:41:43") } });
        let arraySchema = new Schema(1, { arrayField: { type: Type.array, default: [1] } });

        assert.equal(integerSchema.constructor, Schema);
        assert.equal(floatSchema.constructor, Schema);
        assert.equal(stringSchema.constructor, Schema);
        assert.equal(booleanSchema.constructor, Schema);
        assert.equal(dateSchema.constructor, Schema);
        assert.equal(arraySchema.constructor, Schema);
      });
    });
  });
});
