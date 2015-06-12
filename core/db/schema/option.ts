import Schema = require('../schema');
import Type = require('./type');

interface IOption {
  type: Type;
  nullable?: boolean;
  default?: any;
  min?: any;
  max?: any;
  schema?: Schema;
  elementType?: IOption;
}

export = IOption;
