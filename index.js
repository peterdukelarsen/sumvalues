'use strict';
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Set up persistent key-value store with mongoose, mongodb ORM.
const Schema = mongoose.Schema;
const kvSchema = new Schema({
  key: { type: String, required: true, index: { unique: true } },
  value: { type: Number, required: true },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});
const KvModel = mongoose.model('kv', kvSchema);
mongoose.connect('mongodb://localhost/values');

// Get json parsed to javascript object available at req.body.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// List all entries in mongo.
// Curl example: `curl localhost:3000/values`.
app.route('/values').get((req, res) => {
  KvModel.find({}, (err, docs) => {
    if (err) {
      res.status(400).send(err);
    }
    res.send(docs);
  });
});

// Add a value for a key, or update the existing value for that key.
// Curl example:
//   `curl -X POST -H "Content-Type: application/json"
//   -d '{"key":"k", "value":2}' localhost:3000/values`
app.route('/values').post((req, res) => {
  const {key, value} = req.body;
  KvModel.findOne({key}, (err, rec) => {
    if (err) {
      res.status(400).send(err);
    }
    let newKv;
    let statusCode = 200; // Set status to assume update.
    if (rec) {
      rec.key = key;
      rec.value = value;
      rec.updated = Date.now();
      newKv = rec;
    } else {
      // Change status to create if no existing value was found.
      statusCode = 201;
      newKv = new KvModel({ key, value, updated: Date.now() });
    }
    newKv.save((err, rec) => {
      if (err) {
        res.status(400).send(err);
      }
      res.status(statusCode).send(rec);
    });
  });
});

app.listen(port);
