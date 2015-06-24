import logger = require('../core/logger');

export function log(message: string, ...args: any[]): void {
  logger.message('log', message, args);
}
export function info(message: string, ...args: any[]): void {
  logger.message('info', message, args);
}
export function warn(message: string, ...args: any[]): void {
  logger.message('warn', message, args);
}
export function debug(message: string, ...args: any[]): void {
  logger.message('debug', message, args);
}
export function error(message: string, ...args: any[]): void {
  logger.message('error', message, args);
}

export function data(tag: string, data: any, message: string, ...args: any[]): void {
  logger.data(tag, data, message, args);
}
