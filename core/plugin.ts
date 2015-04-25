import Future = require('../lib/future');
import libpath = require('path');
import Response = require('../lib/response');
import Request = require('../lib/request');

let appConfig = require('../config/app');

let plugins: {[name: string]: Plugin} = {};

class Plugin implements IPlugin {
  name: string;
  handler: (req: Request) => Future<Response>;
  private path: string;

  constructor(name: string, path: string) {
    this.name = name;
    this.path = libpath.join(path, './main');

    this.handler = (<any>require(this.path)).handle;
  }

  handle(action: string, callback: IPluginCallback) {
  }
}

const noPlugin: IPlugin = {
  handle(action: string, callback: IPluginCallback) {
    setTimeout(callback.bind(null, new Error('No plugin')));
  }
};

export function get(name) {
  let plugin = plugins[name];
  return plugin ? plugin : noPlugin;
}

export function initialize() {
  let pluginPaths: Dict<string> = appConfig.plugin.paths;
  Object.keys(pluginPaths).forEach(function (name) {
    let path = pluginPaths[name];
    plugins[name] = new Plugin(name, path);
  });
}
