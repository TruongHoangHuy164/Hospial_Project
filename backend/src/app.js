const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middlewares');

const app = express();

app.use(cors({ origin: process.env.ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ app: 'Hospital Backend', status: 'ok' });
});

app.use('/health', require('./routes/health'));
app.use('/api/patients', require('./routes/patients'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
