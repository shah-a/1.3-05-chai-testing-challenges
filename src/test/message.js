require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert

const User = require('../models/user.js')
const Message = require('../models/message.js')

chai.config.includeStack = true

const expect = chai.expect
const should = chai.should()
chai.use(chaiHttp)

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {}
  mongoose.modelSchemas = {}
  mongoose.connection.close()
  done()
})

const SAMPLE_OBJECT_ID = 'aaaaaaaaaaaa' // 12 byte string

describe('Message API endpoints', () => {
  beforeEach((done) => {
    const sampleUser = new User({
      username: 'myuser',
      password: 'mypassword',
      _id: SAMPLE_OBJECT_ID
    })
    sampleUser.save()
      .then(() => {
        done()
      })
  })

  beforeEach((done) => {
    const sampleMessage = new Message({
      title: 'Message Title',
      body: 'Message Body',
      author: SAMPLE_OBJECT_ID,
      _id: SAMPLE_OBJECT_ID
    })
    sampleMessage.save()
      .then(() => {
        done()
      })
  })

  afterEach((done) => {
    Message.deleteMany({ author: SAMPLE_OBJECT_ID })
      .then(() => {
        done()
      })
  })

  afterEach((done) => {
    User.findByIdAndDelete(SAMPLE_OBJECT_ID)
      .then(() => {
        done()
      })
  })

  it('should load all messages', (done) => {
    chai.request(app)
    .get('/messages')
    .end(function (err, res) {
      if (err) done(err)
      expect(res).to.have.status(200)
      expect(res.body.messages).to.be.an('array')
      expect(res.body.messages[0].title).to.equal('Message Title')
      expect(res.body.messages[0].body).to.equal('Message Body')
      done()
    })
  })

  it('should get one specific message', (done) => {
    chai.request(app)
      .get(`/messages/${SAMPLE_OBJECT_ID}`)
      .end(function (err, res) {
        if (err) done(err)
        expect(res).to.have.status(200)
        expect(res.body).to.be.an('object')
        expect(res.body.message.title).to.equal('Message Title')
        expect(res.body.message.body).to.equal('Message Body')
        done()
      })
  })

  it('should post a new message', (done) => {
    chai.request(app)
      .post(`/messages`)
      .send({
        title: "new message title",
        body: "new message body",
        author: SAMPLE_OBJECT_ID
      })
      .end(function (err, res) {
        if (err) done(err)
        expect(res).to.have.status(200)
        expect(res.body.title).to.equal('new message title')
        expect(res.body.body).to.equal('new message body')

        Message.findOne({ title: "new message title" })
        .then(newMessage => {
          expect(newMessage.body).to.equal('new message body')
          done()
        })
      })
  })

  it('should update a message', (done) => {
    chai.request(app)
      .put(`/messages/${SAMPLE_OBJECT_ID}`)
      .send({
        title: "new title"
      })
      .end(function (err, res) {
        if (err) done(err)
        expect(res).to.have.status(200)
        expect(res.body.message.title).to.equal('Message Title')

        Message.findById(SAMPLE_OBJECT_ID)
        .then(updatedMessage => {
          expect(updatedMessage.title).to.equal('new title')
          done()
        })
      })
  })

  it('should delete a message', (done) => {
    chai.request(app)
      .delete(`/messages/${SAMPLE_OBJECT_ID}`)
      .end(function (err, res) {
        if (err) done(err)
        expect(res).to.have.status(200)
        expect(res.body._id).to.equal(SAMPLE_OBJECT_ID)

        Message.findById(SAMPLE_OBJECT_ID)
        .then(deletedMessage => {
          expect(deletedMessage).to.be.null
          done()
        })
      })
  })
})
