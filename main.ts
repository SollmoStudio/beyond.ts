import appConfig = require('./core/config');
import bodyParser = require('body-parser');
import express = require('express');
import db = require('./core/db');
import plugin = require('./core/plugin');

let app = express();

plugin.initialize();
db.initialize(appConfig.mongodb.url)
.onSuccess(() => {
  let exitHandler = () => {
    console.log('Closing db connection.');
    db.close(true);
  };
  let signalExit = (sig: string) => {
    return () => {
      console.log('Process terminated by ' + sig);
      process.exit(0);
    };
  };
  process.on('SIGINT', signalExit('SIGINT'));
  process.on('SIGTERM', signalExit('SIGTERM'));
  process.on('exit', exitHandler);
  process.on('uncaughtException', (ex: Error) => {
    console.error('Uncaught exception %j', ex);
    exitHandler();
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  app.get('/', function (req, res) {
    res.send('Hello World!');
  });

  function handlePlugin(req: express.Request, res: express.Response) {
    plugin.get(req.params.name).handle(req, res);
  }
  app.get('/plugin/:name/:action(*)', handlePlugin);
  app.post('/plugin/:name/:action(*)', handlePlugin);

  let server = app.listen(appConfig.port, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
  });
});
