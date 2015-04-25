let appConfig = require('../config/app');

let plugins: Plugin[] = [];

class Plugin {
  handle(action: string, callback: IPluginCallback) {
  }
}

class NoPlugin extends Plugin {
  handle(action: string, callback: IPluginCallback) {
    setTimeout(callback.bind(null, new Error('No plugin')));
  }
}

const noPlugin = new NoPlugin();

export function get(name) {
  let plugin = plugins[name];
  return plugin ? plugin : noPlugin;
}
