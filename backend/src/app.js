const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { notFound, errorHandler } = require('./middlewares');
const authRouter = require('./routes/auth');
const auth = require('./middlewares/auth');
const authorize = require('./middlewares/authorize');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const doctorsRouter = require('./routes/doctors');
const clinicsRouter = require('./routes/clinics');
const uploadsRouter = require('./routes/uploads');
const specialtiesRouter = require('./routes/specialties');
const doctorSelfRouter = require('./routes/doctorSelf');

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/users', auth, authorize('admin'), usersRouter);
app.use('/api/admin', auth, authorize('admin'), adminRouter);
app.use('/api/doctors', auth, authorize('admin'), doctorsRouter);
app.use('/api/doctor', auth, authorize('doctor'), doctorSelfRouter);
app.use('/api/clinics', auth, authorize('admin'), clinicsRouter);
app.use('/api/uploads', auth, authorize('admin','doctor'), uploadsRouter);
app.use('/api/specialties', auth, authorize('admin'), specialtiesRouter);

// Protected sample route
app.get('/api/profile', auth, (req, res) => {
  res.json({ user: req.user });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
