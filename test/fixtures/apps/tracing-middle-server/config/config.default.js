'use strict';

module.exports = {
  keys: '123456',
  middleware: [ 'xaTracker' ], // 配置需要的中间件，数组顺序即为中间件的加载顺序
  xaTracker: {
    isRootEndPoint: false,
    frequency: 1, // 采样频率
    url: 'http://10.12.31.175:18166/lqm/spanReport',
  },
};
