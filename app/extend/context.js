'use strict';

const assert = require('assert');
const Chance = require('chance');
const chance = new Chance();

module.exports = {
  /**
   * spanId生成函数
   *
   * @return {String} - id
   */
  idGenerator() {
    return chance.string({ pool: '0123456789abcdef', length: 16 });
  },

  /**
  * traceId生成函数
  *
  * @param {String} rootSpanId - root span id
  * @return {String} - traceId
  */
  traceIdGenerator(rootSpanId) {
    assert(typeof rootSpanId === 'string', '[tracker] - rootSpanId should be string');
    const traceIdPrefix = this.idGenerator();
    return traceIdPrefix + rootSpanId;
  },

  /**
   * spanId生成函数
   *
   * @return {String} - span name
   */
  spanName() {
    return chance.string({ length: 16 });
  },
};
