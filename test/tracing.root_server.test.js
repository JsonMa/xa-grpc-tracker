'use strict';

const mock = require('egg-mock');
const assert = require('assert');
const process = require('process');

describe('test/tracing.root_server.test.js', () => {
  let app;
  let ctx;
  before(() => {
    app = mock.app({
      baseDir: 'apps/tracing-root-server',
    });
    return app.ready();
  });

  beforeEach(() => {
    ctx = app.createAnonymousContext();
    if (!process.env.POD_NAME) process.env.POD_NAME = `${app.config.name}`;
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
