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
    // this.ctx.tracker.sendToRemote(2);
    // this.ctx.tracker.sendToRemote(3);
    this.ctx.body = this.ctx.tracker;
  }
}

module.exports = HomeController;
