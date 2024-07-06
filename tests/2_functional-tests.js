const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let issue1;
let issue2;

suite('Functional Tests', function() {
  this.timeout(5000);
  suite('Create an issue', function() {
    test('with every field', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/tests')
        .send({
          issue_title: 'Test 1',
          issue_text: 'test 1',
          created_by: 'Test 1',
          assigned_to: 'Test 1',
          status_text: 'test 1'
        })
        .end(function (err, res) {
          issue1 = res.body
          assert.equal(res.status, 200)
          assert.equal(res.body.issue_title, 'Test 1')
          assert.equal(res.body.issue_text, 'test 1')
          assert.equal(res.body.created_by, 'Test 1')
          assert.equal(res.body.assigned_to, 'Test 1')
          assert.equal(res.body.status_text, 'test 1')
          done()
        })
    })
    test('with only required fields', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/tests')
        .send({
          issue_title: 'Test 2',
          issue_text: 'test 2',
          created_by: 'Test 2',
        })
        .end(function (err, res) {
          issue2 = res.body
          assert.equal(res.status, 200)
          assert.equal(res.body.issue_title, 'Test 2')
          assert.equal(res.body.issue_text, 'test 2')
          assert.equal(res.body.created_by, 'Test 2')
          assert.equal(res.body.assigned_to, '')
          assert.equal(res.body.status_text, '')
          done()
        })
    })
    test('with missing fields', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/tests')
        .send({
          issue_title: 'Test 3',
          issue_text: 'test 3',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.error, 'required field(s) missing')
          done()
        })
    })
  })
  suite('View issues', function() {
    test('on a project', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/tests')
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          done()
        })
    })
    test('on a project with one filter', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/tests')
        .query({ created_by: 'Test 1'})
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body[0].created_by, 'Test 1')
          done()
        })
    })
    test('on a project with multiple filters', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/tests')
        .query({
          created_by: 'Test 1',
          assigned_to: 'Test 1'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body[0].created_by, 'Test 1')
          assert.equal(res.body[0].assigned_to, 'Test 1')
          done()
        })
    })
  })
  suite('Update', function() {
    test('one field on an issue', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/tests')
        .send({
          _id: issue1._id,
          issue_title: 'Test 1 Update'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body._id, issue1._id)
          assert.equal(res.body.result, 'successfully updated')
          done()
        })
    })
    test('multiple fields on an issue', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/tests')
        .send({
          _id: issue1._id,
          issue_title: 'Test 1 Update',
          issue_text: 'test 1 update'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body._id, issue1._id)
          assert.equal(res.body.result, 'successfully updated')
          done()
        })
    })
    test('an issue with missing _id', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/tests')
        .send({
          issue_title: 'Test Update no _id'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.error, 'missing _id')
          done()
        })
    })
    test('an issue with no fields to update', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/tests')
        .send({
          _id: issue1._id,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body._id, issue1._id)
          assert.equal(res.body.error, 'no update field(s) sent')
          done()
        })
    })
    test('an issue with an invalid _id', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/tests')
        .send({
          _id: 'invalid',
          issue_title: 'Test Update invalid _id'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body._id, 'invalid')
          assert.equal(res.body.error, 'could not update')
          done()
        })
    })
  })
  suite('Delete', function() {
    test('an issue', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/tests')
        .send({
          _id: issue2._id,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body._id, issue2._id)
          assert.equal(res.body.result, 'successfully deleted')
          done()
        })
    })
    test('an issue with an invalid _id', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/tests')
        .send({
          _id: 'invalid',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body._id, 'invalid')
          assert.equal(res.body.error, 'could not delete')
          done()
        })
    })
    test('an issue with missing _id', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/tests')
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.error, 'missing _id')
          done()
        })
    })
  })
});
