'use strict';

/**
 * egg-tracker default config
 *
 * @member Config#tracing
 * @property {String} SOME_KEY - some description
 */
exports.xaTracker = {
  isRootEndPoint: true, // 是否为采样根路径
  frequency: 1, // 采样频率
  url: 'http://172.20.192.189:18166/lqm/spanReport', // API链路地址
};
