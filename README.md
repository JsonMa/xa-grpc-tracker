# egg-tracker

  Eggjs tracker plugin which can generate a new tracker object for each **ctx, ctx.request and ctx.response** instance automatically.

## Install

```bash
$ npm i xa-tracker --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.xaTracker = {
  enable: true,
  package: 'xa-grpc-tracker',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.xaTracker = {
  debug: false, // 是否开启debug日志
  port: 50051, // grpc服务监听端口
  url: 'http://10.12.31.175:18166/lqm/spanReport', // 链路监控API地址
};

```

see [config/config.default.js](config/config.default.js) for more detail.

## Example
```js
// {app_root}/controller/index.js

const Controller = require('egg').Controller;

class HomeController extends Controller {
/**
 * Get tracker class through this.ctx.
 * 
 * @memberof HomeController
 */
  async index() {
    const mockGrpcCall = {
      request: {
        trace_id: chance.string({ length: 32 }),
        span_id: chance.string({ length: 16 }),
      },
    };
    const { xaGrpcTracker } = this.ctx;
    const tracker = new xaGrpcTracker(this.ctx, mockGrpcCall);
    tracker.sendToRemote(2); // 接收到请求后上报链路信息
    // some async calls...
    tracker.sendToRemote(3); // 处理完请求后上报链路信息
    this.ctx.body = tracker.trackerParams;
  }
}

module.exports = HomeController;
```


## Questions & Suggestions

Please open an issue [here](https://github.com/JsonMa/egg-tracker/issues).

## License

[MIT](LICENSE)
