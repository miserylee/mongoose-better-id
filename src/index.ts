import * as moment from 'moment';
import { Connection, Document, Model, Schema } from 'mongoose';

const mongooseBetterId = (schema: Schema, {
  connection,
  field = '_id',
  prefix = '',
  suffix = {},
  timestamp = {},
  modelName = '_id_counter',
}: {
  connection?: Connection;
  field?: string;
  prefix?: string;
  suffix?: {
    start?: number;
    step?: number;
    max?: number;
  };
  timestamp?: {};
  modelName?: string;
} = {}) => {
  if (!connection) {
    throw new Error('connection is required!');
  }
  const mixedSuffix: { start: number, step: number, max: number } = Object.assign({
    start: 0,
    step: 1,
    max: 999,
  }, suffix);

  if (mixedSuffix.start >= mixedSuffix.max) {
    throw new Error('suffix.max should greater than suffix.start');
  }
  if (mixedSuffix.step > (mixedSuffix.max - mixedSuffix.start)) {
    throw new Error('suffix.step should not greater than difference between suffix.start and suffix.max');
  }

  const mixedTimestamp: { enable: boolean, format: string } = Object.assign({
    enable: true,
    format: 'YYMMDDHHmm',
  }, timestamp);

  interface IIdCounterDocument extends Document {
    srcModel: string;
    field: string;
    count: number;
    constructor: IIdCounterModel;

    resetCount(): Promise<number>;

    nextCount(): Promise<number>;

    fetch(): Promise<IIdCounterDocument>;
  }

  interface IIdCounterModel extends Model<IIdCounterDocument> {
  }

  let IdCounterModel: IIdCounterModel;
  let counterSchema: Schema;

  try {
    IdCounterModel = connection.model(modelName);
  } catch (err) {
    if (err.name === 'MissingSchemaError') {
      counterSchema = new Schema({
        srcModel: { type: String, required: true },
        field: { type: String, required: true },
        count: { type: Number, default: mixedSuffix.start, min: mixedSuffix.start, max: mixedSuffix.max },
      });
      counterSchema.index({ field: 1, srcModel: 1 }, { unique: true });
      counterSchema.methods.fetch = async function(this: IIdCounterDocument): Promise<IIdCounterDocument> {
        return await this.constructor.findOneAndUpdate({
          srcModel: this.srcModel,
          field: this.field,
        }, {}, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }) as IIdCounterDocument;
      };
      counterSchema.methods.resetCount = async function(this: IIdCounterDocument): Promise<number> {
        const counter = await this.fetch();
        if (counter.count <= mixedSuffix.max) {
          return await counter.nextCount();
        } else {
          const nextCounter = await this.constructor.findOneAndUpdate({
            model: this.model,
            field: this.field,
            count: { $gt: mixedSuffix.max },
          }, {
            $set: {
              count: mixedSuffix.start,
            },
          }, { new: true });
          if (!nextCounter) {
            return await this.nextCount();
          } else {
            return nextCounter.count;
          }
        }
      };
      counterSchema.methods.nextCount = async function(this: IIdCounterDocument): Promise<number> {
        let counter = await this.fetch();
        counter = await this.constructor.findByIdAndUpdate(counter._id, {
          $inc: {
            count: mixedSuffix.step,
          },
        }, { new: true }) as IIdCounterDocument;
        if (counter.count > mixedSuffix.max) {
          return await counter.resetCount();
        } else {
          return counter.count;
        }
      };

      IdCounterModel = connection.model(modelName, counterSchema);
    } else {
      throw err;
    }
  }

  const suffixLength = mixedSuffix.max.toString().length;
  const pad = (count: number) => `${new Array(suffixLength).fill('0').join('')}${count}`.slice(-suffixLength);

  // Add id field to schema;
  const fields: { [prop: string]: any } = {};
  fields[field] = { type: String, required: true };
  if (field !== '_id') {
    fields[field].unique = true;
  }

  schema.add(fields);

  schema.pre('validate', function(this: Document & { [prop: string]: any }, next) {
    if (this.isNew && !this[field]) {
      new IdCounterModel({
        srcModel: (this.constructor as any).modelName,
        field,
      }).nextCount().then(count => {
        this[field] = `${prefix}${mixedTimestamp.enable ? moment().format(mixedTimestamp.format) : ''}${pad(count)}`;
        next();
      }).catch(next);
    } else {
      next();
    }
  });

  schema.statics.genId = function(cb = (err: Error | null, id?: string) => null) {
    return new Promise((resolve, reject) => {
      new IdCounterModel({
        srcModel: this.modelName,
        field,
      }).nextCount().then(count => {
        const id = `${prefix}${mixedTimestamp.enable ? moment().format(mixedTimestamp.format) : ''}${pad(count)}`;
        cb(null, id);
        resolve(id);
      }).catch(err => {
        cb(err);
        reject(err);
      });
    });
  };
};

export = mongooseBetterId;
