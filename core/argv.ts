import yargs = require('yargs');

export = yargs
  .usage('Usage: $0 [options]')
  .alias('c', 'config')
  .describe('c', 'Specify a config file to load')
  .help('h')
  .alias('h', 'help')
  .argv;
