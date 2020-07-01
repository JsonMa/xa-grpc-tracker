# xa-grpc-tracker

  xa grpc tracker plugin which can generate a new tracker object for each **ctx, ctx.request and ctx.response** instance automatically.

## Install

```bash
$ npm i xa-grpc-tracker --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.xaGrpcTracker = {
  enable: true,
  package: 'xa-grpc-tracker',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.xaGrpcTracker = {
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
    const mockGrpcRequest = {
      dln: 'grpc-dln',
      span_name: 'server_span_name',
      span_id: chance.string({ length: 16 }),
      parent_id: chance.string({ length: 16 }),
      trace_id: chance.string({ length: 32 }),
    };
    const { xaGrpcTracker } = this.ctx;
    const trackerServer = new xaGrpcTracker(this.ctx, mockGrpcRequest);

    const span_name = 'client_span_name';
    const { dln, span_id: parent_id, trace_id } = trackerServer.trackerParams;
    const trackerClient = new xaGrpcTracker(this.ctx, { dln, span_name, parent_id, trace_id });

    trackerServer.sendToRemote(1);
    // some async calls...
    trackerClient.sendToRemote(2);
    // some sync calls...
    trackerClient.sendToRemote(3);
    // some sync calls...
    trackerServer.sendToRemote(0);
    this.ctx.body = trackerServer.trackerParams;
  }
}

module.exports = HomeController;
```


## Questions & Suggestions

Please open an issue [here](https://github.com/JsonMa/egg-tracker/issues).

## License

[MIT](LICENSE)
