import Future = require('sfuture');
import _ = require('underscore');
import util = require('util');
import db = require('../../core/db');

interface IDataLogger {
  log(data: any, message: string, args: any[]): Future<void>;
}

/* istanbul ignore next */
class StdoutLogger implements IDataLogger {
  private tag: string;
  constructor(tag: string) {
    this.tag = tag;
  }

  log(data: any, message: string, args: any[]): Future<void> {
    const formattedMessage = util.format(message, ...args);
    console.log('%s: %s with %j', this.tag, formattedMessage, data);
    return Future.successful(null);
  }
}

/* istanbul ignore next */
class StderrLogger implements IDataLogger {
  private tag: string;
  constructor(tag: string) {
    this.tag = tag;
  }

  log(data: any, message: string, args: any[]): Future<void> {
    const formattedMessage = util.format(message, ...args);
    console.error('%s: %s with %j', this.tag, formattedMessage, data);
    return Future.successful(null);
  }
}

class MongodbLogger implements IDataLogger {
  private tag: string;
  private collectionName: string;
  constructor(tag: string, collectionName: string) {
    if (collectionName === '') {
      throw new Error('Cannot set logger: collection cannot be an empty string');
    }

    this.tag = tag;
    this.collectionName = collectionName;
  }

  log(data: any, message: string, args: any[]): Future<void> {
    let formattedMessage = util.format(message, ...args);
    let logDocument = {
      data: data,
      tag: this.tag,
      message: formattedMessage,
      date: new Date()
    };

    let collection = db.connection().collection(this.collectionName);
    return Future.denodify<void>(collection.insert, collection, logDocument);
  }
}

function getLoggerByMethod(method: string, tag: string): IDataLogger {
  /* istanbul ignore next */
  if (method === 'stdout') {
    return new StdoutLogger(tag);
  }

  /* istanbul ignore next */
  if (method === 'stderr') {
    return new StderrLogger(tag);
  }

  if (method.substring(0, 8) === 'mongodb:') {
    let collectionName = method.substring(8);
    return new MongodbLogger(tag, collectionName);
  }

  throw new Error(util.format('Cannot set logger: %j is not valid option for %j', method, tag));
}

export function create(config: { [tag: string]: any }): (tag: string, data: any, message: string, args?: any[]) => Future<void> {
  let logger: { [tag: string]: IDataLogger[] } = { };

  _.map(config, (config: any, tag: string) => {
    if (!config) {
      return;
    }

    if (_.isString(config)) {
      logger[tag] = [ getLoggerByMethod(config, tag) ];
      return;
    }


    if (_.isArray(config)) {
      logger[tag] = config.map((method: string): IDataLogger => {
        return getLoggerByMethod(method, tag);
      });
      return;
    }

    throw new Error(util.format('Cannot set logger: %j is not valid option for %j', config, tag));
  });

  return (tag: string, data: any, message: string, args: any[] = []): Future<void> => {
    if (!logger[tag]) {
      return Future.successful(null);
    }

    let loggers = logger[tag];
    let logging = loggers.map((logger: IDataLogger): Future<void> => {
      return logger.log(data, message, args);
    });

    return <any>Future.sequence(logging);
  };
}
