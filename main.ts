import bodyParser = require('body-parser');
import express = require('express');
import plugin = require('./core/plugin');

let app = express();

(() => {
  plugin.initialize();

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

  let server = app.listen(9000, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
  });
})();
