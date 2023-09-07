require('express-async-errors');
const express = require('express');
const app = express();
const error = require('./middlewares/erros');
const compression = require('compression');

require('./middlewares')(app);
require('./middlewares/routes')(app);

app.use(compression());
app.use(error);

module.exports = app;