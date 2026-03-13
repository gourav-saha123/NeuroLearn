const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const bcrypt = require('bcrypt');

module.exports = {
  signup: async (req, res) => {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).json({ message: 'User created' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  login: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id }, env.JWT_SECRET);
      res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
