import Type = require('./type');

interface IOption {
  type: Type;
  nullable?: boolean;
  default?: any;
  min?: any;
  max?: any;
  schema?: any;
  elementType?: IOption;
}

export = IOption;
