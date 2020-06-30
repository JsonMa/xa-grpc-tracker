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
    trackerClient.sendToRemote(3);
    // some sync calls...
    trackerClient.sendToRemote(2);
    // some sync calls...
    trackerServer.sendToRemote(0);
    this.ctx.body = trackerServer.trackerParams;
  }
}

module.exports = HomeController;
