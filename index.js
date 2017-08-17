const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tlan = require('tlan');

module.exports = function (schema, {
  connection,
  field = '_id',
  prefix = '',
  suffix = {},
  timestamp = {}
}) {
  if (!connection) throw new Error('connection is required!');
  suffix = Object.assign({
    start: 0,
    step: 1,
    max: 999,
  }, suffix);

  if (suffix.start >= suffix.max) throw new Error('suffix.max should greater than suffix.start');
  if (suffix.step > (suffix.max - suffix.start)) throw new Error('suffix.step should not greater than difference between suffix.start and suffix.max');

  timestamp = Object.assign({
    enable: true,
    format: 'yyMMddhhmm'
  }, timestamp);

  let IdCounterModel;
  let counterSchema;

  try {
    IdCounterModel = connection.model('IdCounter');
  } catch (err) {
    if (err.name === 'MissingSchemaError') {
      counterSchema = new Schema({
        model: { type: String, required: true },
        field: { type: String, required: true },
        count: { type: Number, default: suffix.start, min: suffix.start, max: suffix.max }
      });
      counterSchema.index({ field: 1, model: 1 }, { unique: true, required: true, index: -1 });

      counterSchema.methods.fetch = function (cb) {
        const doc = this;
        const query = {
          model: this.model,
          field: this.field
        };
        doc.constructor.findOneAndUpdate(query, {}, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }, function (err, counter) {
          if (err) return cb(err);
          else cb(null, counter);
        });
      };

      counterSchema.methods.nextCount = function (cb) {
        const doc = this;
        doc.fetch(function (err, counter) {
          if (err)return cb(err);
          else {
            doc.constructor.findByIdAndUpdate(counter.id, {
              $inc: {
                count: suffix.step
              }
            }, { new: true }, function (err, counter) {
              if (err) return cb(err);
              else {
                if (counter.count > suffix.max) {
                  counter.resetCount(cb);
                } else {
                  cb(null, counter.count);
                }
              }
            });
          }
        });
      };

      counterSchema.methods.resetCount = function (cb) {
        const doc = this;
        doc.fetch(function (err, counter) {
          if (err) return cb(err);
          else {
            if (counter.count <= suffix.max) {
              counter.nextCount(cb);
            } else {
              doc.constructor.findOneAndUpdate({
                model: doc.model,
                field: doc.field,
                count: { $gt: suffix.max }
              }, {
                $set: {
                  count: suffix.start
                }
              }, { new: true }, function (err, counter) {
                if (err) return cb(err);
                else if (!counter) {
                  doc.nextCount(cb);
                } else cb(null, counter.count);
              });
            }
          }
        });
      };

      IdCounterModel = connection.model('IdCounter', counterSchema);
    } else {
      throw err;
    }
  }

  const suffixLength = suffix.max.toString().length;
  const pad = function (count) {
    return `${new Array(suffixLength).fill('0').join('')}${count}`.slice(-suffixLength);
  };

  // Add id field to schema.
  const fields = {};
  fields[field] = {
    type: String,
    require: true
  };
  if (field !== '_id') {
    fields[field].unique = true;
  }
  schema.add(fields);

  schema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew && !doc[field]) {
      IdCounterModel({
        model: doc.constructor.modelName,
        field
      }).nextCount(function (err, count) {
        if (err) return next(err);
        else {
          doc[field] = `${prefix}${timestamp.enable ? new Date().format(timestamp.format) : ''}${pad(count)}`;
          next();
        }
      });
    } else next();
  });

  schema.statics.genId = function (cb = _ => _) {
    return new Promise((resolve, reject) => {
      IdCounterModel({
        model: this.modelName,
        field
      }).nextCount((err, count) => {
        if(err) {
          cb(err);
          return reject(err);
        }
        const id = `${prefix}${timestamp.enable ? new Date().format(timestamp.format) : ''}${pad(count)}`;
        cb(null, id);
        return resolve(id);
      });
    });
  }

};
