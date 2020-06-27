'use strict';

/**
 * egg-tracker default config
 *
 * @member Config#tracing
 * @property {String} SOME_KEY - some description
 */
exports.xaGrpcTracker = {
  debug: false,
  port: 50051, // gpc服务监听地址
  url: 'http://172.20.192.189:18166/lqm/spanReport', // API链路地址
};
