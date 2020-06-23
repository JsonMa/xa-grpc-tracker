'use strict';

const { v1: uuidv1 } = require('uuid');
const assert = require('assert');

module.exports = {
  /**
   * spanId生成函数
   *
   * @param { Number } count - 调用次数
   * @return {String} - id
   */
  idGenerator(count = 0) {
    const idPrefix = uuidv1().split('-').join('');
    if (count >= 1) return idPrefix;
    return idPrefix + this.idGenerator(++count);
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
};
