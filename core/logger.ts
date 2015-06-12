import util = require('util');

const LOG = 'log';
const INFO = 'info';
const WARN = 'warn';
const DEBUG = 'debug';
const ERROR = 'error';

function loggingInternal(level: string, message: string, args: any[]) {
  const formattedMessage = util.format(message, ...args);

  console.log('%s: %s', level, formattedMessage);
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
