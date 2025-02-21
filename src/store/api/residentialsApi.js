import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { residentialsData } from '@/data/residentials'

export const residentialsApi = createApi({
  reducerPath: 'residentialsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    getResidentials: builder.query({
      queryFn: () => {
        // Simulasi API call dengan mock data
        return { data: residentialsData }
      }
    }),
    getResidentialById: builder.query({
      queryFn: (id) => {
        const residential = residentialsData.find(p => p.id === id)
        return { data: residential }
      }
    })
  })
})

export const {
  useGetResidentialsQuery,
  useGetResidentialByIdQuery,
} = residentialsApi