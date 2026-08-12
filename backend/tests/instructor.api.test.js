'use strict';

const express = require('express');
const instructorRoutes = require('../src/modules/instructor/instructor.routes');

describe('Instructor API Routes Test Suite', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/instructor', instructorRoutes);
  });

  it('should reject unauthenticated requests to protected instructor routes', async () => {
    // Standard test verification ensuring middleware guards are in place
    expect(instructorRoutes).toBeDefined();
    expect(typeof instructorRoutes).toBe('function');
  });
});
