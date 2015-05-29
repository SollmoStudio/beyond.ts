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
    return checkers[type](value);
  }

  return true;
}

function hasMinMax(type: Type): boolean {
  return type === Type.integer || type === Type.float || type === Type.date;
}

function errorIfNotPass(validator: () => boolean, message: string, ...args: any[]) {
  if (!validator()) {
    let formatArgument = args;
    formatArgument.unshift(message);
    let errorMessage = util.format.apply(null, formatArgument);
    throw new Error(errorMessage);
  }
}

function isSchema(value: any): boolean {
  return !_.isUndefined(value) && !_.isUndefined(value.constructor) && value.constructor === Schema;
}

function validateOption(option: Option, name: string): boolean {
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
