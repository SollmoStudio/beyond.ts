import _ = require('underscore');
import argv = require('./argv');
import path = require('path');

const configPath = argv.c ?
  path.isAbsolute(argv.c) ? argv.c : path.join(process.cwd(), argv.c) :
  '../config/app';

const config = require(configPath);

const defaultConfig = {
  port: 9000,
  methods: ["post"]
};

export = _.defaults(config, defaultConfig);
