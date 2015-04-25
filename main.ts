import express = require('express');
import plugin = require('./core/plugin');

let app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/plugin/:name/:action', function (req, res) {
  let name = req.params.name;
  let action = req.params.action;

  plugin.get(name).handle(req, res);
});

let server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
