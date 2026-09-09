import axios from 'axios'

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
})

export const fetchPosts = async (query = '') => {
  const { data } = await api.get('/posts', {
    params: query ? { q: query } : undefined,
  })
  return data
}

export const fetchPostById = async (id) => {
  const { data } = await api.get(`/posts/${id}`)
  return data
}

export default api
