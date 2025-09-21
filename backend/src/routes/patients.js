const { Router } = require('express');
const Patient = require('../models/Patient');

const router = Router();

// Create
router.post('/', async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (err) { next(err); }
});

// List (basic pagination)
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Patient.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Patient.countDocuments(),
    ]);
    res.json({ items, total, page, limit });
  } catch (err) { next(err); }
});

// Get by id
router.get('/:id', async (req, res, next) => {
  try {
    const item = await Patient.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not Found' });
    res.json(item);
  } catch (err) { next(err); }
});

// Update
router.put('/:id', async (req, res, next) => {
  try {
    const item = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Not Found' });
    res.json(item);
  } catch (err) { next(err); }
});

// Delete
router.delete('/:id', async (req, res, next) => {
  try {
    const item = await Patient.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not Found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
