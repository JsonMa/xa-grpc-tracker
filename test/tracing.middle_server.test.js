'use strict';

const mock = require('egg-mock');
const assert = require('assert');
const process = require('process');

describe('test/tracing.middle_server.test.js', () => {
  let app;
  let ctx;
  before(() => {
    app = mock.app({
      baseDir: 'apps/tracing-middle-server',
    });
    return app.ready();
  });

  beforeEach(() => {
    ctx = app.createAnonymousContext();
    if (!process.env.POD_NAME) process.env.POD_NAME = `${app.config.name}`;
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should response with parentId', () => {
    const rootSpanId = ctx.idGenerator();
    const traceId = ctx.traceIdGenerator(rootSpanId);
    const parentId = ctx.idGenerator();
    return app.httpRequest()
      .get('/')
      .set('Span-Id', parentId)
      .set('Trace-Id', traceId)
      .expect(200)
      .expect('Content-Type', /json/)
      .then(response => {
        assert.equal(response.body.trace_id, traceId);
        assert(response.body.span_id);
        assert.equal(response.body.parent_id, parentId);
      });
  });
});
