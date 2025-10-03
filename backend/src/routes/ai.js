const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { chatComplete } = require('../services/openrouter');

// Protected AI chat endpoint: POST /api/ai/chat
// Body: { messages?: [{role, content}], prompt?: string, model?: string, temperature?: number }
router.post('/chat', auth, authorize('admin','doctor','staff'), asyncHandler(async (req, res) => {
  const { messages, prompt, model, temperature } = req.body || {};
  const msgs = Array.isArray(messages) && messages.length
    ? messages
    : [{ role: 'user', content: String(prompt || '').trim() }];
  if(!msgs[0]?.content){
    return res.status(400).json({ message: 'Missing messages or prompt' });
  }
  const result = await chatComplete({ messages: msgs, model, temperature });
  res.json({ content: result.content, provider: 'openrouter', model: model, raw: result.raw });
}));

module.exports = router;
