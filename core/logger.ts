import Future = require('sfuture');
import _ = require('underscore');
import util = require('util');
import MessageLogger = require('./logger/message');
import DataLogger = require('./logger/data');

let messageLogger: { (level: string, message: string, args: any[]): Future<void> } = undefined;
let dataLogger: { (tag: string, data: any, message: string, args: any[]): Future<void> } = undefined;

const LOG = 'log';
const INFO = 'info';
const WARN = 'warn';
const DEBUG = 'debug';
const ERROR = 'error';
const ValidLevel = [ LOG, INFO, WARN, DEBUG, ERROR ];

export function initialize(levelConfig: any, tagConfig: any) {
  let validLevelConfig = _.pick(levelConfig, ...ValidLevel);

  messageLogger = MessageLogger.create(validLevelConfig);

  dataLogger = DataLogger.create(tagConfig);
}

export function message(level: string, message: string, args: any[]): Future<void> {
  if (!messageLogger) {
    return Future.successful(null);
  }

  if (ValidLevel.indexOf(level) < 0) {
    return Future.failed<void>(new Error(util.format('%j is not valid level', level)));
  }

  return messageLogger(level, message, args);
}

export function data(tag: string, data: any, message: string, args: any[]): Future<void> {
  if (!dataLogger) {
    return Future.successful(null);
  }

  return dataLogger(tag, data, message, args);
}
