'use strict';
const assert = require('assert');
const Chance = require('chance');
const chance = new Chance();
const os = require('os');

/**
 * Tracker Class
 *
 * @return {String} - id
 */
class Tracker {
  /**
   * Tracker constructor
   *
   * @param {Object} ctx          - egg context
   * @param {Object} span_name    - span name
   * @param {Object} call         - grpc call
   */
  constructor(ctx, span_name, call) {
    assert(span_name, '[grpc tracker] - span name is required');
    assert(call && call.request, '[grpc tracker] - no grpc request detected');
    assert(call && call.request.trace_id && call.request.span_id && call.request.dln, '[grpc tracker] - trace id, parent id and dln are required');

    const { trace_id, span_id: parent_id, dln } = call.request;
    this.ctx = ctx;
    const DLN = dln;
    const POD_NAME = process.env.POD_NAME;
    const service_name = POD_NAME && POD_NAME.replace(/-/gi, '_');
    assert(service_name, '[grpc tracker] - service name is required');
    this.trackerConfig = ctx.app.config.xaGrpcTracker;
    this.trackerParams = {
      trace_id,
      parent_id,
      span_id: this.idGenerator(),
      span_name,
      DLN,
    };
    this.endPoint = {
      addrs: {
        port: this.trackerConfig.port || 50051, // grpc default port
        host: process.env.POD_IP || this.getServerIp(), // POD_IP或者虚拟机IP
      },
      service_name,
    };
  }

  /**
   * spanId生成函数
   *
   * @param {String} type - 类型
   * @return {String} - id
   * @memberof Tracker
   */
  sendToRemote(type) {
    assert([0, 1, 2, 3, 4, 5, 6, 7].includes(type), '[grpc tracker] - annotation type error');
    setImmediate(async () => {
      let data = null;
      if ([1, 2, 4, 6 ].includes(type)) data = Object.assign({}, { start_endpoint: this.endPoint }, this.trackerParams);
      if ([0, 3, 5, 7].includes(type)) data = Object.assign({}, { finish_endpoint: this.endPoint }, this.trackerParams);
      data.annotation = {
        timestamp: Date.now(),
        type,
      };
      if (this.trackerConfig.debug) this.ctx.logger.info(JSON.stringify(data));
      const trackerResp = await this.ctx.curl(this.trackerConfig.url, { method: 'POST', contentType: 'json', dataType: 'json', timeout: 6000, data }).catch(err => {
        this.ctx.logger.error('[grpc tracker] - request failed, error', err);
      });
      if (trackerResp && trackerResp.status !== 200) {
        this.ctx.logger.error(`[grpc tracker] - request failed, status: ${trackerResp.status}`);
        return;
      }
      const { errorCode, errorInfo } = trackerResp.data;
      if (errorCode !== 0) this.ctx.logger.error(`[tracker] - request failed, code: ${errorCode}, msg: ${errorInfo}`);
      else this.ctx.logger.info(`[grpc tracker] - request success, code: ${errorCode}, msg: ${errorInfo}`);
    });
  }

  /**
   * spanId生成函数
   *
   * @return {String} - id
   * @memberof Tracker
   */
  idGenerator() {
    return chance.string({ pool: '0123456789abcdef', length: 16 });
  }

  /**
  * traceId生成函数
  *
  * @param {String} rootSpanId - root span id
  * @return {String} - traceId
  * @memberof Tracker
  */
  traceIdGenerator(rootSpanId) {
    assert(typeof rootSpanId === 'string', '[grpc tracker] - rootSpanId should be string');
    const traceIdPrefix = this.idGenerator();
    return traceIdPrefix + rootSpanId;
  }

  /**
   * spanId生成函数
   *
   * @return {String} - span name
   * @memberof Tracker
   */
  spanName() {
    return chance.string({ length: 16 });
  }

  /**
   * 获取服务端IP
   *
   * @return {String} - server ip
   * @memberof Tracker
   */
  getServerIp() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
      if (!devName.includes('en')) return;
      const _interface = interfaces[devName];
      for (let i = 0; i < _interface.length; i++) {
        const alias = _interface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
}

module.exports = Tracker;
