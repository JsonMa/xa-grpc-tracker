'use strict';

const sinon = require('sinon');
const Controller = require('egg').Controller;
const util = require('util');
const assert = require('assert');
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
    const curl = () => {
      return new Promise(resolve => {
        resolve({
          data: {
            errorCode: '0',
            errorMsg: 'success',
          },
        });
      });
    };
    // sinon.replace(this.ctx, 'curl', curl);
    this.ctx.tracker.sendToRemote(1);
    this.ctx.body = this.ctx.tracker;
  }
}

module.exports = HomeController;
