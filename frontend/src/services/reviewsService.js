import api from './api'

export const getCarReviews = (carId, params) => api.get(`/cars/${carId}/reviews`, { params })
export const createReview = (carId, data) => api.post(`/cars/${carId}/reviews`, data)
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data)
export const deleteReview = (id) => api.delete(`/reviews/${id}`)
