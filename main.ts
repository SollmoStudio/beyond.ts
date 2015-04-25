import express = require('express');
import plugin = require('./core/plugin');

let app = express();

plugin.initialize();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/plugin/:name/:action', function (req, res) {
  let name = req.params.name;
  let action = req.params.action;

  plugin.get(name).handle(action, function (err, resObj) {
    if (err) {
      res.status(404).send(`No plugin named ${name}.`);
    } else {
      res.json(resObj);
    }
  });
});

let server = app.listen(9000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
