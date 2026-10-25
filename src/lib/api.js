import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('siaga_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('siaga_token')
      localStorage.removeItem('siaga_user')
      window.dispatchEvent(new Event('siaga:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error) {
  const response = error?.response
  if (response?.data?.errors) {
    const first = Object.values(response.data.errors)[0]
    if (Array.isArray(first) && first[0]) return first[0]
  }
  return response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.'
}

export default api
