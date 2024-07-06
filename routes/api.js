'use strict';
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)

let issueSchema = new mongoose.Schema({
  project: {
    type: String,
    required: true,
  },
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_on: Date,
  updated_on: Date,
  created_by: {
    type: String,
    required: true
  },
  assigned_to: String,
  open: Boolean,
  status_text: String
}, { versionKey: false })

let Issue = mongoose.model('Issue', issueSchema)

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      const project = req.params.project;
      let listOfIssues = await Issue.find({ project }, { project: 0 })
      if (req.query) {
        Object.entries(req.query).forEach((keyvalue) => {
          if (keyvalue[0] === 'open' || keyvalue[0] === '_id') {
            listOfIssues = listOfIssues.filter((obj) => String(obj[keyvalue[0]]) === keyvalue[1])
          } else if (keyvalue[0] === 'created_on' || keyvalue[0] === 'updated_on') {
            listOfIssues = listOfIssues.filter((obj) => obj[keyvalue[0]] === new Date(keyvalue[1]))
          } else {
            listOfIssues = listOfIssues.filter((obj) => obj[keyvalue[0]] === keyvalue[1])
          }
        })
      }
      res.json(listOfIssues)
    })
    
    .post(async function (req, res){
      const project = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: 'required field(s) missing' });
      } else {
        const created_on = new Date(Date.now());
        const updated_on = created_on
        if (!assigned_to) {
          assigned_to = '';
        };
        if (!status_text) {
          status_text = '';
        };
        const newIssue = await Issue.create({
          project,
          issue_title,
          issue_text,
          created_on,
          updated_on,
          created_by,
          assigned_to,
          open: true,
          status_text
        })
        const _id = newIssue._id
        res.json({
          _id,
          issue_title,
          issue_text,
          created_on,
          updated_on,
          created_by,
          assigned_to,
          open: true,
          status_text
        });
      };
    })
    
    .put(async function (req, res){
      const project = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open} = req.body;
      if (!_id) {
        res.json({ error: 'missing _id' })
      } else if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
        res.json({ error: 'no update field(s) sent', _id })
      } else {
        try {
          let updatedIssue = await Issue.findByIdAndUpdate(_id, {
            ...req.body,
            updated_on: new Date(Date.now())
          })
          updatedIssue.save()
          res.json({ result: 'successfully updated', _id })
        } catch (err) {
          res.json({ error: 'could not update', _id})
        }
      }
    })
    
    .delete(async function (req, res){
      const project = req.params.project
      const _id = req.body._id
      if (!_id) {
        res.json({ error: 'missing _id' })
      } else {
        try {
          let deletedIssue = await Issue.findByIdAndDelete(_id)
          deletedIssue.save()
          res.json({ result: 'successfully deleted', _id })
        } catch (err) {
          res.json({ error: 'could not delete', _id })
        }
      }
    });
    
};
