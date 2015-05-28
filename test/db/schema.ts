import assert = require('assert');
import Schema = require('../../lib/db/schema');
import Type = require('../../lib/db/schema/type');
import db = require('../../lib/db');

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

    describe('#validate min/max value', () => {
      it('min value of the integer type has to be integer', () => {
        assert.throws(
          () => {
            let integerSchema = new Schema(1, { integerField: { type: Type.integer, min: 3.4 } });
            handleUnused(integerSchema);
          },
          (err: Error) => {
            return (err instanceof Error) && err.message === 'min value of integerField(3.4) is not integer.';
          }
        );
      });

      it('min value of the float type has to be float', () => {
        assert.throws(
          () => {
            let floatSchema = new Schema(1, { floatField: { type: Type.float, min: "not float" } });
            handleUnused(floatSchema);
          },
          (err: Error) => {
            return (err instanceof Error) && err.message === 'min value of floatField("not float") is not float.';
          }
        );
      });

      it('min value of the date type has to be date', () => {
        assert.throws(
          () => {
            let dateSchema = new Schema(1, { dateField: { type: Type.date, min: "2015-05-29 01:41:43" } });
            handleUnused(dateSchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'min value of dateField("2015-05-29 01:41:43") is not date.';
          }
        );
      });

      it('max value of the integer type has to be integer', () => {
        assert.throws(
          () => {
            let integerSchema = new Schema(1, { integerField: { type: Type.integer, max: 3.4 } });
            handleUnused(integerSchema);
          },
          (err: Error) => {
            return (err instanceof Error) && err.message === 'max value of integerField(3.4) is not integer.';
          }
        );
      });

      it('max value of the float type has to be float', () => {
        assert.throws(
          () => {
            let floatSchema = new Schema(1, { floatField: { type: Type.float, max: "not float" } });
            handleUnused(floatSchema);
          },
          (err: Error) => {
            return (err instanceof Error) && err.message === 'max value of floatField("not float") is not float.';
          }
        );
      });

      it('max value of the date type has to be date', () => {
        assert.throws(
          () => {
            let dateSchema = new Schema(1, { dateField: { type: Type.date, max: "2015-05-29 01:41:43" } });
            handleUnused(dateSchema);
          },
          (err: Error) => {
            return (err instanceof Error)
            && err.message === 'max value of dateField("2015-05-29 01:41:43") is not date.';
          }
        );
      });

      it('success to create schema when the min type is correct', () => {
        let minIntegerSchema = new Schema(1, { integerField: { type: Type.integer, min: 3 } });
        let minFloatSchema = new Schema(1, { floatField: { type: Type.float, min: 3.5 } });
        let minDateSchema = new Schema(1, { dateField: { type: Type.date, min: new Date("2015-05-29 01:41:43") } });

        let maxIntegerSchema = new Schema(1, { integerField: { type: Type.integer, max: 3 } });
        let maxFloatSchema = new Schema(1, { floatField: { type: Type.float, max: 3.5 } });
        let maxDateSchema = new Schema(1, { dateField: { type: Type.date, max: new Date("2015-05-29 01:41:43") } });

        assert.equal(minIntegerSchema.constructor, Schema);
        assert.equal(minFloatSchema.constructor, Schema);
        assert.equal(minDateSchema.constructor, Schema);
        assert.equal(maxIntegerSchema.constructor, Schema);
        assert.equal(maxFloatSchema.constructor, Schema);
        assert.equal(maxDateSchema.constructor, Schema);
      });


      it('boolean field cannot has min constraint.', () => {
        assert.throws(
          () => {
            let booleanSchema = new Schema(1, { booleanField: { type: Type.boolean, min: true } });
            handleUnused(booleanSchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'booleanField(boolean type) field cannot has min constraint.';
          }
        );
      });

      it('boolean field cannot has max constraint.', () => {
        assert.throws(
          () => {
            let booleanSchema = new Schema(1, { booleanField: { type: Type.boolean, max: true } });
            handleUnused(booleanSchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'booleanField(boolean type) field cannot has max constraint.';
          }
        );
      });

      it('string field cannot has min constraint.', () => {
        assert.throws(
          () => {
            let stringSchema = new Schema(1, { stringField: { type: Type.string, min: "str" } });
            handleUnused(stringSchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'stringField(string type) field cannot has min constraint.';
          }
        );
      });

      it('string field cannot has max constraint.', () => {
        assert.throws(
          () => {
            let stringSchema = new Schema(1, { stringField: { type: Type.string, max: "str" } });
            handleUnused(stringSchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'stringField(string type) field cannot has max constraint.';
          }
        );
      });

      it('array field cannot has min constraint.', () => {
        assert.throws(
          () => {
            let arraySchema = new Schema(1, { arrayField: { type: Type.array, min: [] } });
            handleUnused(arraySchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'arrayField(array type) field cannot has min constraint.';
          }
        );
      });

      it('array field cannot has max constraint.', () => {
        assert.throws(
          () => {
            let arraySchema = new Schema(1, { arrayField: { type: Type.array, max: [] } });
            handleUnused(arraySchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'arrayField(array type) field cannot has max constraint.';
          }
        );
      });

      it('embedding field cannot has min constraint.', () => {
        assert.throws(
          () => {
            let integerSchema = new Schema(1, { someField: { type: Type.integer } });
            let embeddingSchema = new Schema(1, { embeddingField: { type: Type.embedding, min: integerSchema } });
            handleUnused(embeddingSchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'embeddingField(embedding type) field cannot has min constraint.';
          }
        );
      });

      it('embedding field cannot has max constraint.', () => {
        assert.throws(
          () => {
            let integerSchema = new Schema(1, { someField: { type: Type.integer } });
            let embeddingSchema = new Schema(1, { embeddingField: { type: Type.embedding, max: integerSchema } });
            handleUnused(embeddingSchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'embeddingField(embedding type) field cannot has max constraint.';
          }
        );
      });

      it('objectId field cannot has min constraint.', () => {
        assert.throws(
          () => {
            let objectId = db.ObjectId();
            let objectIdSchema = new Schema(1, { objectIdField: { type: Type.objectId, min: objectId } });
            handleUnused(objectIdSchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'objectIdField(objectId type) field cannot has min constraint.';
          }
        );
      });

      it('objectId field cannot has max constraint.', () => {
        assert.throws(
          () => {
            let objectId = db.ObjectId();
            let objectIdSchema = new Schema(1, { objectIdField: { type: Type.objectId, max: objectId } });
            handleUnused(objectIdSchema);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'objectIdField(objectId type) field cannot has max constraint.';
          }
        );
      });

      it('min must less than max.', () => {
        assert.throws(
          () => {
            let floatField = new Schema(1, { floatField: { type: Type.float, max: 3.5, min: 4.0 } });
            handleUnused(floatField);
          },
          (err: Error) => {
            return (err instanceof Error) &&
              err.message === 'floatField\'s min(4) has to less than max(3.5).';
          }
        );
      });
    });
  });
});
