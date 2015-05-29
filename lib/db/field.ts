import _ = require('underscore');
import assert = require('assert');
import util = require('util');
import ObjectId = require('./object-id');
import Option = require('./schema/option');
import Schema = require('./schema');
import Type = require('./schema/type');

class Field<T> {
  private _type: Type;
  private _name: string;
  private _default: T;
  private _nullable: boolean;

  static create(option: Option, name: string): Field<any> {
    validateOption(option, name);

    const type = option.type;
    const nullable = option.nullable || false;
    const defaultValue = option.default;
    const min = option.min;
    const max = option.max;
    const schema = option.schema;
    const elementType = option.elementType;

    switch (type) {
      case Type.integer:
        return new IntegerField(name, nullable, defaultValue, min, max);
      case Type.float:
        return new FloatField(name, nullable, defaultValue, min, max);
      case Type.string:
        return new StringField(name, nullable, defaultValue);
      case Type.boolean:
        return new BooleanField(name, nullable, defaultValue);
      case Type.date:
        return new DateField(name, nullable, defaultValue, min, max);
      case Type.array:
        let typeOfItem = Field.create(elementType, util.format("of.%s", name));
        return new ArrayField(name, nullable, defaultValue, typeOfItem);
      case Type.embedding:
        return new EmbeddingField(name, nullable, defaultValue, schema);
      case Type.objectId:
        return new ObjectIdField(name, nullable, defaultValue);
    }
  }

  constructor(name: string, type: Type, defaultValue: T, nullable: boolean) {
    this._name = name;
    this._type = type;
    this._default = defaultValue;
    this._nullable = nullable;
  }

  type(): Type {
    return this._type;
  }
  name(): string {
    return this._name;
  }
}

export = Field;

function isInteger(value: number): boolean {
  return _.isNumber(value) && value % 1 === 0;
}

function isSchema(value: any): boolean {
  return !_.isUndefined(value) && !_.isUndefined(value.version) && !_.isUndefined(value.fields) && _.isArray(value.fields);
}

function isObjectId(value: any): boolean {
  return value && value.constructor && value.constructor === ObjectId;
}

const typeCheckers: { [type: string]: (value: any) => boolean } = {
  [Type.boolean]: _.isBoolean,
  [Type.integer]: isInteger,
  [Type.float]: _.isNumber,
  [Type.string]: _.isString,
  [Type.date]: _.isDate,
  [Type.array]: _.isArray,
  [Type.embedding]: (value: any) => { return true; },
  [Type.objectId]: isObjectId
};

function errorIfNotPass(validator: () => boolean, message: string, ...args: any[]) {
  if (!validator()) {
    let formatArgument = args;
    formatArgument.unshift(message);
    let errorMessage = util.format.apply(null, formatArgument);
    throw new Error(errorMessage);
  }
}

function isDefined(value: any): boolean {
  if (_.isNull(value)) {
    return false;
  }
  if (_.isUndefined(value)) {
    return false;
  }
  return true;
}

function checkType(value: any, type: Type): boolean {
  if (isDefined(value)) {
    return typeCheckers[type](value);
  }

  return true;
}

function hasMinMax(type: Type): boolean {
  return type === Type.integer || type === Type.float || type === Type.date;
}

function hasTypeField(value: any): boolean {
  assert(!_.isUndefined(value));
  return !_.isUndefined(value.type);
}

function validateOption(option: Option, name: string) {
  errorIfNotPass(() => { return checkType(option.default, option.type); }, 'default value of %s(%j) is not %s.', name, option.default, Type[option.type]);

  if (hasMinMax(option.type)) {
    errorIfNotPass(() => { return checkType(option.min, option.type); }, 'min value of %s(%j) is not %s.', name, option.min, Type[option.type]);
    errorIfNotPass(() => { return checkType(option.max, option.type); }, 'max value of %s(%j) is not %s.', name, option.max, Type[option.type]);

    if (isDefined(option.min) && isDefined(option.max)) {
      errorIfNotPass(() => { return option.min < option.max; }, '%s\'s min(%j) has to less than max(%j).', name, option.min, option.max);
    }
  } else {
    errorIfNotPass(() => { return _.isUndefined(option.min); }, '%s(%s type) field cannot has min constraint.', name, Type[option.type]);
    errorIfNotPass(() => { return _.isUndefined(option.max); }, '%s(%s type) field cannot has max constraint.', name, Type[option.type]);
  }

  if (option.type === Type.embedding) {
    errorIfNotPass(() => { return !_.isUndefined(option.schema); }, 'embedding type(%s) should have schema option.', name);
    errorIfNotPass(() => { return isSchema(option.schema); }, 'schema option of %s is not Schema.', name);
  } else {
    errorIfNotPass(() => { return _.isUndefined(option.schema); }, '%s type(%s) cannot have schema option.', Type[option.type], name);
  }

  if (option.type === Type.array) {
    errorIfNotPass(() => { return !_.isUndefined(option.elementType); }, 'array type(%s) should have elementType option.', name);
    errorIfNotPass(() => { return hasTypeField(option.elementType); }, 'elementType(%j) of %s should have type.', option.elementType, name);
    validateOption(option.elementType, util.format("of.%s", name));
  } else {
    errorIfNotPass(() => { return _.isUndefined(option.elementType); }, '%s type(%s) cannot have elementType option.', Type[option.type], name);
  }
}

class IntegerField extends Field<number> {
  private _min: number;
  private _max: number;

  constructor(name: string, nullable: boolean, defaultValue: number, min: number, max: number) {
    super(name, Type.integer, defaultValue, nullable);
    this._min = min;
    this._max = max;
  }
}

class FloatField extends Field<number> {
  private _min: number;
  private _max: number;

  constructor(name: string, nullable: boolean, defaultValue: number, min: number, max: number) {
    super(name, Type.float, defaultValue, nullable);
    this._min = min;
    this._max = max;
  }
}

class StringField extends Field<string> {
  constructor(name: string, nullable: boolean, defaultValue: string) {
    super(name, Type.string, defaultValue, nullable);
  }
}

class BooleanField extends Field<boolean> {
  constructor(name: string, nullable: boolean, defaultValue: boolean) {
    super(name, Type.boolean, defaultValue, nullable);
  }
}

class DateField extends Field<Date> {
  private _min: Date;
  private _max: Date;

  constructor(name: string, nullable: boolean, defaultValue: Date, min: Date, max: Date) {
    super(name, Type.date, defaultValue, nullable);
    this._min = min;
    this._max = max;
  }
}

class EmbeddingField extends Field<any> {
  private _schema: Schema;

  constructor(name: string, nullable: boolean, defaultValue: any, schema: Schema) {
    super(name, Type.embedding, defaultValue, nullable);
    this._schema = schema;
  }
}

class ArrayField<T> extends Field<T[]> {
  private _elementType: Field<T>;

  constructor(name: string, nullable: boolean, defaultValue: T[], elementType: Field<T>) {
    super(name, Type.array, defaultValue, nullable);
    this._elementType = elementType;
  }
}

class ObjectIdField extends Field<ObjectId> {
  constructor(name: string, nullable: boolean, defaultValue: ObjectId) {
    super(name, Type.objectId, defaultValue, nullable);
  }
}
