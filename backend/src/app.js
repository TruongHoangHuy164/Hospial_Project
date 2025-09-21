const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middlewares');
const authRouter = require('./routes/auth');
const auth = require('./middlewares/auth');
const authorize = require('./middlewares/authorize');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');

const app = express();

app.use(cors({ origin: process.env.ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ app: 'Hospital Backend', status: 'ok' });
});

app.use('/health', require('./routes/health'));
app.use('/api/auth', authRouter);
app.use('/api/patients', require('./routes/patients'));

app.use('/api/users', auth, authorize('admin'), usersRouter);
app.use('/api/admin', auth, authorize('admin'), adminRouter);

// Protected sample route
app.get('/api/profile', auth, (req, res) => {
  res.json({ user: req.user });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
