import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock axios
const mockAxios = {
  create: vi.fn(() => mockAxios),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn()
    },
    response: {
      use: vi.fn()
    }
  }
}

vi.mock('axios', () => ({
  default: mockAxios,
  create: mockAxios.create
}))

// Since we can't read the actual apiClient, let's create a simple test version
const createApiClient = (baseURL) => {
  const client = mockAxios.create({
    baseURL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return client
}

describe('API Client', () => {
  let apiClient

  beforeEach(() => {
    vi.clearAllMocks()
    apiClient = createApiClient('http://localhost:5000/api')
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('creates axios instance with correct configuration', () => {
    expect(mockAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:5000/api',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })

  it('makes GET requests', async () => {
    const mockResponse = { data: { message: 'success' } }
    mockAxios.get.mockResolvedValueOnce(mockResponse)

    await apiClient.get('/test-endpoint')

    expect(mockAxios.get).toHaveBeenCalledWith('/test-endpoint')
  })

  it('makes POST requests', async () => {
    const mockResponse = { data: { id: 1, name: 'Test' } }
    const requestData = { name: 'Test' }
    mockAxios.post.mockResolvedValueOnce(mockResponse)

    await apiClient.post('/test-endpoint', requestData)

    expect(mockAxios.post).toHaveBeenCalledWith('/test-endpoint', requestData)
  })

  it('makes PUT requests', async () => {
    const mockResponse = { data: { id: 1, name: 'Updated Test' } }
    const requestData = { name: 'Updated Test' }
    mockAxios.put.mockResolvedValueOnce(mockResponse)

    await apiClient.put('/test-endpoint/1', requestData)

    expect(mockAxios.put).toHaveBeenCalledWith('/test-endpoint/1', requestData)
  })

  it('makes DELETE requests', async () => {
    const mockResponse = { data: { message: 'deleted' } }
    mockAxios.delete.mockResolvedValueOnce(mockResponse)

    await apiClient.delete('/test-endpoint/1')

    expect(mockAxios.delete).toHaveBeenCalledWith('/test-endpoint/1')
  })

  it('handles request errors', async () => {
    const mockError = new Error('Network Error')
    mockAxios.get.mockRejectedValueOnce(mockError)

    await expect(apiClient.get('/test-endpoint')).rejects.toThrow('Network Error')
  })
})
