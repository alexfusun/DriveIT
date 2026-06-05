import api from './api'

export const getUsers = (params) => api.get('/admin/users', { params })
export const updateUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role })
export const updatePublisherRank = (id, rank) => api.patch(`/admin/publishers/${id}/rank`, { rank })
