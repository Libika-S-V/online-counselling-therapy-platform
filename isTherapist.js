module.exports = (req, res, next) => {
  if (req.user && req.user.role === 'therapist') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Therapist privileges required.' });
  }
};
