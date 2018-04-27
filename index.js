'use strict';
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.route('/values').get((req, res) => {
  res.send(data.getAll());
});
app.route('/values').post((req, res) => {
  const {key, value} = req.body;
  try {
    console.log(req.body);
    console.log(Number(value));
    data.upsert(key, Number(value));
    res.send('Saved.');
  } catch (err) {
    res.status(400).send(err);
  }
});

app.listen(port);

let data = {
  store: {},
  upsert(k, v) {
    if (!typeof k === 'string') {
      throw new Error('Invalid key type, must be string');
    }
    if (typeof v !== 'number'
			|| isNaN(v)
			|| v === Number.POSITIVE_INFINITY
			|| v === Number.NEGATIVE_INFINITY) {
      throw new Error(`Invalid value type, 
      	must be number, not NaN, or +/-inf.`);
    }
    this.store[k] = {
      v: v,
      ud: Date.now(),
    };
  },
  get(k) {
    return this.store[k];
  },
  getAll() {
    // Return copy of the data store.
    return Object.assign(this.store, {});
  },

};
