const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  name: String,
  gender: String
});


const connection = mongoose.createConnection('mongodb://localhost/mongooseBetterId');

const betterId = require('../');

schema.plugin(betterId, {
  connection,
  field: '_id',
  prefix: 'person',
  suffix: {
    start: 0,
    step: 1,
    max: 100,
  },
  timestamp: {
    enable: true,
    format: 'YYMMDDhhmmssS'
  }
});

const Person = connection.model('person', schema);

for (let i = 0; i < 100; i++) {
  Person({
    name: 'Misery',
    gender: 'male'
  }).save(console.log);
}
for (let i = 0; i < 100; i++) {
  Person({
    _id: new mongoose.Types.ObjectId,
    name: 'Misery',
    gender: 'male'
  }).save(console.log);
}
