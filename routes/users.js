'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { Strategy: LocalStrategy } = require('passport-local');
const User = require('../models/user');
const router = express.Router();

router.post('/', (req, res, next) => {
  

  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  const strFields = ['fullname', 'username', 'password'];
  const noStrField = strFields.find(result => result in req.body && typeof req.body[result] !== 'string');
  if (noStrField) {
    const err = new Error(`${noStrField} should be a string`);
    err.status = 422;
    return next(err);
  }

  const whiteSpace = ['username', 'password'];
  const doesItHaveWS = whiteSpace.find(result => req.body[result].trim() !== req.body[result]);
  if(doesItHaveWS) {
    const err = new Error(`${doesItHaveWS} must not start or end with a space`);
    err.status = 422;
    return next(err);
  }

  const sizedFields = {username: {min:1}, password: {min: 8, max: 72}};
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    const err = new Error('username must have at least one char, password must have at least 8 and no more than 72 characters');
    err.status = 422;
    return next(err);
  }



  let {username, password, fullname} = req.body;

  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        fullname
      };
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201).location(`/api/users/${result.id}`).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;