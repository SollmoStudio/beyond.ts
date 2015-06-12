import _ = require('underscore');
import MessageLogger = require('./logger/message');

let messageLogger: { (level: string, message: string, args: any[]): void } = undefined;

const LOG = 'log';
const INFO = 'info';
const WARN = 'warn';
const DEBUG = 'debug';
const ERROR = 'error';

export function initialize(levelConfig: any) {
  const ValidLevel = [ LOG, INFO, WARN, DEBUG, ERROR ];
  let validLevelConfig = _.pick(levelConfig, ...ValidLevel);

  messageLogger = MessageLogger.create(validLevelConfig);
}

function loggingInternal(level: string, message: string, args: any[]) {
  if (!messageLogger) {
    return;
  }

  messageLogger(level, message, args);
}

export function log(message: string, ...args: any[]) {
  loggingInternal(LOG, message, args);
}
export function info(message: string, ...args: any[]) {
  loggingInternal(INFO, message, args);
}
export function warn(message: string, ...args: any[]) {
  loggingInternal(WARN, message, args);
}
export function debug(message: string, ...args: any[]) {
  loggingInternal(DEBUG, message, args);
}
export function error(message: string, ...args: any[]) {
  loggingInternal(ERROR, message, args);
}
