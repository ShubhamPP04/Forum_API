const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

module.exports = generateToken;