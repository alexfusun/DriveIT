import api from './api'

export const getPublishers = (params) => api.get('/publishers', { params })
export const getPublisher = (id) => api.get(`/publishers/${id}`)
export const getPublisherReviews = (id, params) => api.get(`/publishers/${id}/reviews`, { params })
