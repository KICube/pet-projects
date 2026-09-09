import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

export const fetchFacts = async ({ page = 1, limit = 20 } = {}) => {
  const { data } = await api.get('/facts', {
    params: { page, limit },
  })
  return {
    items: data.data ?? [],
    total: data.total ?? 0,
    page: data.current_page ?? page,
    lastPage: data.last_page ?? 1,
  }
}

export const fetchRandomFact = async () => {
  const { data } = await api.get('/fact')
  return data
}

export default api
