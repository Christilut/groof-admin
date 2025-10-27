import { DataProvider } from '@refinedev/core'
import { axiosInstance, API_URL } from '../config/axios'

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    const { current = 1, pageSize = 1000 } = pagination || {}

    // Build query params
    const params: any = {
      page: current,
      limit: pageSize
    }

    // Add filters
    if (filters) {
      filters.forEach((filter: any) => {
        if (filter.operator === 'eq' && filter.value !== undefined) {
          params[filter.field] = filter.value
        }
      })
    }

    // Add sorters
    if (sorters && sorters.length > 0) {
      params.sortBy = sorters[0].field
      params.sortOrder = sorters[0].order
    }

    const { data } = await axiosInstance.get(`/admin/${resource}`, { params })

    return {
      data: data[resource] || data.logs || [],
      total: data.pagination?.total || 0
    }
  },

  getOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.get(`/admin/${resource}/${id}`)

    return {
      data: data[resource.slice(0, -1)] || data.log || data.user
    }
  },

  create: async ({ resource, variables }) => {
    const { data } = await axiosInstance.post(`/admin/${resource}`, variables)

    return {
      data
    }
  },

  update: async ({ resource, id, variables }) => {
    const { data } = await axiosInstance.patch(`/admin/${resource}/${id}`, variables)

    return {
      data: data.user || data
    }
  },

  deleteOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.delete(`/admin/${resource}/${id}`)

    return {
      data
    }
  },

  getApiUrl: () => API_URL,

  custom: async ({ url, method, payload, query, headers }) => {
    const requestUrl = `${API_URL}${url}`

    const { data } = await axiosInstance({
      url: requestUrl,
      method,
      data: payload,
      params: query,
      headers
    })

    return {
      data
    }
  }
}
