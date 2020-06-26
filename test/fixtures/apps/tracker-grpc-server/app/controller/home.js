'use strict';

const Controller = require('egg').Controller;
const Chance = require('chance');
const chance = new Chance();

/**
 * HomeController Class
 *
 * @return {String} - id
 */
class HomeController extends Controller {
/**
 * index controller
 *
 * @return {String} - id
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
    tracker.sendToRemote(2);
    // some async calls...
    tracker.sendToRemote(3);
    this.ctx.body = tracker.trackerParams;
  }
}

module.exports = HomeController;
