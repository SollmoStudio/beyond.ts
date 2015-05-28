import _ = require('underscore');
import util = require('util');
import Option = require('./schema/option');
import Type = require('./schema/type');
import ObjectId = require('./object-id');

function isInteger(value: number): boolean {
  return _.isNumber(value) && value % 1 === 0;
}

function isObjectId(value: any): boolean {
  return value && value.constructor && value.constructor === ObjectId;
}

const checkers: { [type: string]: (value: any) => boolean } = {
  [Type.boolean]: _.isBoolean,
  [Type.integer]: isInteger,
  [Type.float]: _.isNumber,
  [Type.string]: _.isString,
  [Type.date]: _.isDate,
  [Type.array]: _.isArray,
  [Type.embedding]: (value: any) => { return true; },
  [Type.objectId]: isObjectId
};

function checkType(value: any, type: Type): boolean {
  if (_.isNull(value)) {
    return true;
  }
  if (_.isUndefined(value)) {
    return true;
  }

  return checkers[type](value);
}

function hasMinMax(type: Type): boolean {
  return type === Type.integer || type === Type.float || type === Type.date;
}

function validateOption(option: Option, name: string): boolean {
  if (!checkType(option.default, option.type)) {
    throw new Error(util.format('default value of %s(%j) is not %s.', name, option.default, Type[option.type]));
  }

  if (hasMinMax(option.type)) {
    if (!checkType(option.min, option.type)) {
      throw new Error(util.format('min value of %s(%j) is not %s.', name, option.min, Type[option.type]));
    }
    if (!checkType(option.max, option.type)) {
      throw new Error(util.format('max value of %s(%j) is not %s.', name, option.max, Type[option.type]));
    }
  } else {
    if (!_.isUndefined(option.min)) {
      throw new Error(util.format('%s(%s type) field cannot has min constraint.', name, Type[option.type]));
    }
    if (!_.isUndefined(option.max)) {
      throw new Error(util.format('%s(%s type) field cannot has max constraint.', name, Type[option.type]));
    }
  }
  return true;
}

class Schema {
  private version: number;
  private fields: { [name: string]: Option };

  constructor(version: number, fields: { [name: string]: Option }) {
    this.version = version;
    _.map(fields, validateOption);
    this.fields = fields;
  }
}

export = Schema;
