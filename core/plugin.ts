import express = require('express');

let appConfig = require('../config/app');

let plugins: Plugin[] = [];

class Plugin {
  handle(req: express.Request, res: express.Response) {
  }
}

class NoPlugin extends Plugin {
  handle(req: express.Request, res: express.Response) {
    res.status(404).send(`No plugin named ${req.params.name}.`);
  }
}

const noPlugin = new NoPlugin();

export function get(name) {
  let plugin = plugins[name];
  return plugin ? plugin : noPlugin;
}
