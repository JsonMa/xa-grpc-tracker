'use strict';
const assert = require('assert');

module.exports = options => {
  return async function tracker(ctx, next) {
    let tracker = {}; // 初始化tracker
    if (!ctx.app.trackerCount) ctx.app.trackerCount = 0; // 采样控制
    const { headers } = ctx;
    const { rootEndPoint, url } = options;
    const DLN = ctx.app.config.name;
    let trace_id = headers['trace-id'];
    let parent_id = headers['span-id'];
    const span_id = ctx.idGenerator(); // 当前节点id
    if (rootEndPoint) {
      const port = ctx.request.hostname.split(':')[1];
      trace_id = ctx.traceIdGenerator(span_id);
      parent_id = '0';
      tracker.start_endpoint = {
        addrs: {
          port,
          host: ctx.request.ip,
        }, // request
        ...process.env.POD_NAME ? { service_name: process.env.POD_NAME } : null,
      };
    } else {
      if (!trace_id || !parent_id) return; // 非链路采样数据
    }

    tracker.sendToRemote = async type => {
      assert([0, 1, 2, 3, 4, 5, 6, 7].includes(type), '[tracker] - annotation type error');
      const data = Object.assign({}, tracker);
      const annotation = {
        timestamp: Date.now(),
        type,
      };
      data.annotation = annotation;
      delete data.sendToRemote;
      const trackerResp = await ctx.curl(url, { method: 'POST', contentType: 'json', dataType: 'json', timeout: 6000, data }).catch(err => {
        ctx.logger.error('[tracker] - request failed, error', err);
      });
      if (trackerResp && trackerResp.status !== 200) {
        ctx.logger.error(`[tracker] - request failed, status: ${trackerResp.status}`);
        return;
      }
      const { errorCode, errorInfo } = trackerResp.data;
      if (errorCode !== 0) ctx.logger.error(`[tracker] - request failed, code: ${errorCode}, msg: ${errorInfo}`);
      else ctx.logger.info(`[tracker] - request success, code: ${errorCode}, msg: ${errorInfo}`);
    };
    tracker = Object.assign(tracker, {
      DLN,
      span_id,
      parent_id,
      trace_id,
    });
    ctx.tracker = ctx.request.tracker = ctx.response.tracker = tracker;
    ctx.tracker.sendToRemote(1); // sr
    await next();
    ctx.tracker.sendToRemote(0); // ss
  };
};
