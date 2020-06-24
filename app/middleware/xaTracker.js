'use strict';
const assert = require('assert');

module.exports = options => {
  return async function tracker(ctx, next) {
    let tracker = {}; // 初始化tracker
    const { isRootEndPoint, url, frequency } = options;
    if (!ctx.app.trackerCount) ctx.app.trackerCount = 0; // 采样控制
    const shouldSampling = ++ctx.app.trackerCount === frequency;
    if (shouldSampling) {
      const receiveType = isRootEndPoint ? 4 : 1;
      const sendType = isRootEndPoint ? 5 : 0;
      const { headers } = ctx;
      ctx.app.trackerCount = 0;
      const DLN = ctx.app.config.name.replace(/-/gi, '_');
      let trace_id = headers['trace-id'];
      let parent_id = headers['span-id'];
      const port = ctx.request.host.split(':')[1];
      const endPoint = {
        addrs: {
          port,
          host: ctx.request.ip,
        },
        ...process.env.POD_NAME ? { service_name: process.env.POD_NAME.replace(/-/gi, '_') } : null,
      };
      const span_id = ctx.idGenerator();
      const span_name = `${DLN}_${ctx.spanName()}`;
      if (isRootEndPoint) {
        trace_id = ctx.traceIdGenerator(span_id);
        parent_id = '0';
      } else {
        if (!trace_id || !parent_id) return; // 非链路采样数据
      }
      tracker.sendToRemote = async type => {
        assert([0, 1, 2, 3, 4, 5, 6, 7].includes(type), '[tracker] - annotation type error');
        let data = null;
        const annotation = {
          timestamp: Date.now(),
          type,
        };
        if ([1, 2, 4, 6 ].includes(type)) data = Object.assign({ start_endpoint: endPoint }, tracker);
        if ([0, 3, 5, 7].includes(type)) data = Object.assign({ finish_endpoint: endPoint }, tracker);
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
        span_name,
        parent_id,
        trace_id,
      });
      ctx.tracker = ctx.request.tracker = ctx.response.tracker = tracker;
      ctx.tracker.sendToRemote(receiveType);
      await next();
      ctx.tracker.sendToRemote(sendType);
    } else await next();
  };
};
