import api from './api'

export const getMe = () => api.get('/users/me')
export const getMyReviews = (params) => api.get('/users/me/reviews', { params })
export const updateMe = (data) => api.put('/users/me', data)
