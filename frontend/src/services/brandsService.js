import api from './api'

export const getBrands = () => api.get('/brands')
export const getBrandModels = (id) => api.get(`/brands/${id}/models`)
