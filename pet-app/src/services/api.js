import axios from 'axios'

const api = axios.create({
  baseURL: 'https://petstore.swagger.io/v2',
  timeout: 10000,
})

export const fetchPets = async ({ status = 'available', name = '', page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  params.set('page', String(page))
  params.set('limit', String(limit))

  const { data } = await api.get('/pet/findByStatus', {
    params,
  })

  let items = Array.isArray(data) ? data : []
  if (name.trim()) {
    const q = name.trim().toLowerCase()
    items = items.filter((pet) => (pet.name || '').toLowerCase().includes(q))
  }
  return items
}

export const fetchPetById = async (id) => {
  const { data } = await api.get(`/pet/${id}`)
  return data
}

export const createPet = async (pet) => {
  const { data } = await api.post('/pet', pet)
  return data
}

export const updatePet = async (pet) => {
  const { data } = await api.put('/pet', pet)
  return data
}

export const deletePet = async (id) => {
  const { data } = await api.delete(`/pet/${id}`)
  return data
}

export default api
