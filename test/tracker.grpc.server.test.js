'use strict';

const mock = require('egg-mock');
const assert = require('assert');
const process = require('process');

describe('test/tracker.grpc.server.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/tracker-grpc-server',
    });
    return app.ready();
  });

  beforeEach(() => {
    if (!process.env.POD_NAME) process.env.POD_NAME = `${app.config.name}`;
    if (!process.env.POD_IP) process.env.POD_IP = '192.18.3.165';
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should response with traceId, spanId and root spanId', () => {
    return app.httpRequest()
      .get('/')
      .expect(200)
      .expect('Content-Type', /json/)
      .then(response => {
        assert(response.body.trace_id);
        assert(response.body.span_id);
        assert(response.body.parent_id);
      });
  });
});
