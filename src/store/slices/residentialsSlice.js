// src/store/slices/residentialsSlice.js
import { createSlice } from '@reduxjs/toolkit'
import { residentialsData } from '@/data/residentials'

const initialState = {
  residentials: residentialsData,
  filters: {
    region: null,
    city: null,
    area: null,
  },
  selectedResidential: null
}

const residentialsSlice = createSlice({
  name: 'residentials',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters[action.payload.name] = action.payload.value
    },
    setSelectedResidential: (state, action) => {
      state.selectedResidential = action.payload
    }
  }
})

export const { setFilter, setSelectedResidential } = residentialsSlice.actions
export default residentialsSlice.reducer