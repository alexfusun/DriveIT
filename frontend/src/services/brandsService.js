import api from './api'

export const getBrands = () => api.get('/brands')
export const getBrandModels = (id) => api.get(`/brands/${id}/models`)
export const createBrand = (data) => api.post('/brands', data)
export const createModel = (brandId, data) => api.post(`/brands/${brandId}/models`, data)
