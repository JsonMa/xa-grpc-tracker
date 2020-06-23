# egg-tracker

  Eggjs tracker plugin which can generate a new tracker object for each **ctx, ctx.request and ctx.response** instance automatically.

## Install

```bash
$ npm i xa-tracker --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.tracker = {
  enable: true,
  package: 'xa-tracker',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.xaTracker = {
  rootEndPoint: true, // 是否为根节点
  url: 'http://10.12.31.175:18166/lqm/spanReport', // 链路监控API地址
};

exports.middleware = ['xaTracker'] // Enable tracker middleware

```

see [config/config.default.js](config/config.default.js) for more detail.

## Example
```js
// {app_root}/controller/index.js

const Controller = require('egg').Controller;

class HomeController extends Controller {
/**
 * Get tracker object through ctx, ctx.request or ctx.response.
 *
 * @params {string} tracker.trace_id      - get from http header of trace-id or autoGenerate by plugin if rootEndPoint is true.
 * @params {string} tracker.span_id       - generate by plugin automatically.
 * @params {string} tracker.parent_id     - get from http header of span-id or autoGenerate by plugin if rootEndPoint is true.
 * 
 * @memberof HomeController
 */
  async index() {
    this.ctx.tracker.sendToRemote(1); // 上报链路信息（异步）
    this.ctx.body = this.ctx.tracker;
  }
}

module.exports = HomeController;
```


## Questions & Suggestions

Please open an issue [here](https://github.com/JsonMa/egg-tracker/issues).

## License

[MIT](LICENSE)
