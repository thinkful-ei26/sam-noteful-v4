'use strict';

const express = require('express');
// const mongoose = require('mongoose');
// const User = require('../models/user');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');


function createAuthToken (user) {
  return jwt.sign({user}, JWT_SECRET, {
    subject:user.username,
    expiresIn: JWT_EXPIRY
  });
}

const options = {session: false, failWithError: true};

const localAuth = passport.authenticate('local', options);

router.post('/login', localAuth, function (req, res) {
  const authToken = createAuthToken(req.user);
  res.json({authToken});
});


module.exports = router;