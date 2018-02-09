## mongoose-better-id ![NPM version](https://img.shields.io/npm/v/mongoose-better-id.svg?style=flat)

Mongoose plugin for auto-generate better-read _id

### Installation
```bash
$ yarn add mongoose-better-id
```

### Example
```js
const betterId = require('mongoose-better-id');

schema.plugin(betterId, {
  connection,
  field: '_id',
  prefix: 'person',
  suffix: {
    start: 0,
    step: 1,
    max: 99,
  },
  timestamp: {
    enable: true,
    format: 'yyMMddhhmmssS'
  }
});
```

### Options
* connection {`MongooseConnection`} `required` The db to save id counter;
* field {`string`} `default: '_id'` The field to generate id;
* prefix {`string`} `default: ''` The prefix string of the id;
* suffix {`object`} The suffix of the id, it's a auto increment number;
  - start {`number`} `default: 0` The start number of the suffix;
  - step {`number`} `default: 1` The step of the suffix to increment every time to generate;
  - max {`number`} `default: 999` The max value of the suffix, when the suffix reached the value it will reset to start value;
* timestamp {`object`} The timestamp string between prefix and suffix;
  - enable {`boolean`} `default: true` When set `true`, a string of the certain `format` of current time will add between prefix and suffix;
  - format {`string`} `default: 'yyMMddhhmm'` The format the current time will be formatted.

An id string will look like `1610211329190` with default options;

### Caution
The suffix is cycling between start and max value, so if you generate more than the max mount of the suffix
in the same time (eg. in 1 minute the default timestamp between prefix and suffix will not change),
it will cause an unique error on id field.
So you must:
1. Change the timestamp format to contain the `S`(like `yyMMddhhmmssS`), which means millisecond, to prevent the trouble as for as possible.
2. Add a pre save middleware after use the plugin to add your custom random string after the id.
3. BTW, for general business, 1000 times of data create in 1 minutes is really enough :)

### Contributing
- Fork this Repo first
- Clone your Repo
- Install dependencies by `$ npm install`
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Publish your local branch, Open a pull request
- Enjoy hacking <3

### MIT license
Copyright (c) 2016-2018 Misery Lee &lt;miserylee@foxmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---
built upon love by [docor](git+https://github.com/turingou/docor.git) v0.3.0
