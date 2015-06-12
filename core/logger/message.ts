import _ = require('underscore');
import util = require('util');

interface IMessageLogger {
  log(message: string, args: any[]): void;
}

class StdoutLogger implements IMessageLogger {
  private level: string;
  constructor(level: string) {
    this.level = level;
  }

  log(message: string, args: any[]): void {
    const formattedMessage = util.format(message, ...args);
    console.log('%s: %s', this.level, formattedMessage);
  }
}

class StderrLogger implements IMessageLogger {
  private level: string;
  constructor(level: string) {
    this.level = level;
  }

  log(message: string, args: any[]): void {
    const formattedMessage = util.format(message, ...args);
    console.error('%s: %s', this.level, formattedMessage);
  }
}

function getLoggerByMethod(method: string, level: string): IMessageLogger {
  if (method === 'stdout') {
    return new StdoutLogger(level);
  }

  if (method === 'stderr') {
    return new StderrLogger(level);
  }

  throw new Error(util.format('Cannot set logger: %j is not valid option for %j', method, level));
}

export function create(config: { [level: string]: any }): (level: string, message: string, args: any[]) => void {
  let logger: { [level: string]: IMessageLogger[] } = { };

  _.map(config, (config: any, level: string) => {
    if (!config) {
      return;
    }

    if (_.isString(config)) {
      logger[level] = [ getLoggerByMethod(config, level) ];
      return;
    }


    if (_.isArray(config)) {
      logger[level] = config.map((method: string): IMessageLogger => {
        return getLoggerByMethod(method, level);
      });
      return;
    }

    throw new Error(util.format('Cannot set logger: %j is not valid option for %j', config, level));
  });

  return (level: string, message: string, args: any[]): void => {
    if (!logger[level]) {
      return;
    }

    let loggers = logger[level];
    loggers.map((logger: IMessageLogger): void => {
      logger.log(message, args);
    });
  };
}
