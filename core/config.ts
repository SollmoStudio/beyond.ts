import _ = require('underscore');
import minimist = require('minimist');
import path = require('path');

var argv: any = minimist(process.argv.slice(2));

var config = require(argv.c ? path.join(process.cwd(), argv.c) : '../config/app');
var defaultConfig = {
  port: 9000,
  methods: ["post"]
};

export = _.defaults(config, defaultConfig);
