import api from './api'

export const likeReview = (reviewId) => api.post(`/reviews/${reviewId}/like`)
export const unlikeReview = (reviewId) => api.delete(`/reviews/${reviewId}/like`)
