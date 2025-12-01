import { describe, it, expect } from '@jest/globals'
import request from 'supertest'
import { app } from '../../app.js'

describe('API Basics', () => {
  it('GET /api/health returns OK status', async () => {
    const res = await request(app).get('/api/health').expect(200)
    expect(res.body).toHaveProperty('status', 'OK')
    expect(res.body).toHaveProperty('message')
  })

  it('returns 404 for unknown API route', async () => {
    await request(app).get('/api/unknown-route').expect(404)
  })

  it('returns 404 for non-API route', async () => {
    const res = await request(app).get('/some-frontend-route').expect(404)
    expect(res.body).toHaveProperty('message')
  })
})
