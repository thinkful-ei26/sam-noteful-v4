'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullname = 'Example User';
  const fullnameb = ' Example User ';
  const usernameb = '';
  const passwordb = '';
  const usernamec = undefined;
  const passwordc  = undefined;
  const usernamed = 'exampleUser   ';
  const passwordd = 'examplePass   ';
  const usernamee = null;
  const passworde = null;
  const bigasspass = 'qwertyuiojdhlkjsahdflkjasdhflkjashdlfkjashdlkfjahslkdjfhalksjdfhlkasjdfhlkasjdhflkajsdhflkajsdhflkjasdhflkjahsdlfkjahlsdkjfhalskdjfhlaksjdfhlkasjdfhlaksjdfhlkasjdfhlkasjdfhlkasjdfhlkajsdfhlkajsdhflkajsdhflkjasdhfkljasdhflkajsdhflkajsdfhlkajsdfhlaksjdfhlaksjdfhaslkjdfhaslkdjfhaslkdjf';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true, useCreateIndex : true })
      .then(() => User.deleteMany());
  });

  beforeEach(function () {
    return User.createIndexes();
  });

  afterEach(function () {
    return User.deleteMany();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('POST /api/users', function () {

    it('Should create a new user', function () {
      let res;
      return chai
        .request(app)
        .post('/api/users')
        .send({ username, password, fullname })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'username', 'fullname');
          expect(res.body.id).to.exist;
          expect(res.body.username).to.equal(username);
          expect(res.body.fullname).to.equal(fullname);
          console.log(fullname + ' here');
          return User.findOne({ username });
        })
        .then(user => {
          expect(user).to.exist;
          expect(user.id).to.equal(res.body.id);
          expect(user.fullname).to.equal(fullname);
          return user.validatePassword(password);
        })
        .then(isValid => {
          expect(isValid).to.be.true;
        });
    });

    it('Should reject users with missing username', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({usernameb, password, fullname})
        .then(result => {
          res = result;
          //   console.log(usernameb + 'ub');
          expect(res).to.have.status(422);
        });
    });
    
    it('Should reject users with missing password', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({username, passwordb, fullname})
        .then(result => {
          res = result;
          //   console.log(passwordb + 'pb');
          expect(res).to.have.status(422);
        });
    });
    it('Should reject users with non-string username', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({usernamec, password, fullname})
        .then(result => {
          res = result;
          //   console.log(usernamec);
          expect(res).to.have.status(422);
        });
    });
    it('Should reject users with non-string password', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({username, passwordc, fullname})
        .then(result => {
          res = result;
          //   console.log(passwordc);
          expect(res).to.have.status(422);
        });
    });
    it('Should reject users with non-trimmed username', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({usernamed, password, fullname})
        .then(result => {
          res = result;
          //   console.log(usernamec);
          expect(res).to.have.status(422);
        });
    });
    it('Should reject users with non-trimmed password', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({username, passwordd, fullname})
        .then(result => {
          res = result;
          //   console.log(passwordd);
          expect(res).to.have.status(422);
        });
    });
    it('Should reject users with empty username', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({usernamee, password, fullname})
        .then(result => {
          res = result;
          //   console.log(usernamec);
          expect(res).to.have.status(422);
        });
    });
    it('Should reject users with password less than 8 characters', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({username, passworde, fullname})
        .then(result => {
          res = result;
          expect(res).to.have.status(422);
        });
    });
    it('Should reject users with password greater than 72 characters', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({username, bigasspass, fullname})
        .then(result => {
          res = result;  
          expect(res).to.have.status(422);
        });
    });
    it('Should reject users with duplicate username', function () {
      return User.create({
        username,
        password,
      })
        .then(() => {
          let res = {username: 'msgreen'};
          return chai.request(app)
            .post('/api/users')
            .send({username, password, fullname})
            .then(result => {
              res = result;
              expect(res).to.have.status(400);
            });
        });
    });

    it('Should trim fullname', function () {
      let res;
      return chai
        .request(app)
        .post('/api/users')
        .send({ username, password, fullname: fullnameb })
        .then(_res => {
          res = _res;
          console.log(fullnameb);
          expect(res.body.fullname).to.equal('Example User');
        });
    });

  });

});