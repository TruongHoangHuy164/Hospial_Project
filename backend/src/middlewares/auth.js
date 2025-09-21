const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.user = payload; // contains id, email, name, role
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
}

module.exports = auth;
