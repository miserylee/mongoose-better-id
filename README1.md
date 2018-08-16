## mongoose-better-id ![NPM version](https://img.shields.io/npm/v/mongoose-better-id.svg?style=flat)

Mongoose插件  自动生成更加友好的   id

### 安装
```bash
$ yarn add mongoose-better-id
```

### 示例
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
    format: 'YYMMDDHHmmssS'
  }
});
```

### 配置
* connection {`MongooseConnection`} 必填 存储`id`的数据库 ;
* field {`string`}   生成的`id`字段名  `默认:  '_id'` ;
* prefix {`string`}   `id`的`string`前缀  `默认:  ''` ;
* suffix {`object`} `id`的后缀值 它是一个自动增加的数值  ;
  - start {`number`} 后缀初始值  `默认:  0` ;
  - step {`number`}  后缀只每次自动增加的数值区间 `默认:  1`  ;
  - max {`number`} 后缀最大值，当后缀值达到最大值时将会从初始值开始重新计数 `默认:  999` ;
* timestamp {`object`} 前后缀间的时间戳  ;
  - enable {`boolean`} 当设置为`true`时，添加一段确定格式(`format`)的时间字段至前缀和后缀之间 `默认: true`  ;
  - format {`string`}  当前时间格式 `默认: 'YYMMDDHHmm'` .

在默认情况下会生成类似于 `1610211329190`  这样的`id` ;

### 注意
后缀在初始值到最大值之间进行循环，如果生成的数值超过了后缀的最大值，同时（例如： 在1分钟内前后缀的默认时间戳没有发生变化，将会引起id字段产生唯一的错误。   
因此你需要：
1. 在时间戳中添加`S`(毫秒  例如 `YYMMDDHHmmssS`)，来尽可能的避免错误。
2. 添加一个pre save中间件，即使用`schema.pre('save',...)`在`id`后添加随机字符串。   
  `schema.pre('save',...)`方法将会在保存前进行调用，并用next实现业务连接。
3. 顺便说一句，对于一般的业务场景而言，在1分钟内创建1000条数据的频率已经足够了，因此正常情况下是不会出现唯一`id`冲突的。

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
