import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { residentials } from '@/data/residentials'

export const residentialsApi = createApi({
  reducerPath: 'propertyApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    getProperties: builder.query({
      queryFn: () => {
        // Simulasi API call dengan mock data
        return { data: residentials }
      }
    }),
    getPropertyById: builder.query({
      queryFn: (id) => {
        // Simulasi get single property
        const property = residentials.find(p => p.id === parseInt(id))
        return { data: property }
      }
    })
  })
})

export const {
  useGetPropertiesQuery,
  useGetPropertyByIdQuery
} = residentialsApi