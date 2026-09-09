<template>
  <div class="app">
    <header class="app-header">
      <h1>Pet Explorer</h1>
      <p class="subtitle">Browse and manage pets from Swagger Petstore</p>
    </header>

    <main class="app-main">
      <section class="controls">
        <input
          v-model="searchName"
          type="text"
          placeholder="Search by pet name..."
          class="input"
          @input="onSearchInput"
        />
        <select v-model="status" class="select" @change="resetPage">
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </select>
        <button class="button primary" @click="openCreateForm">Add pet</button>
      </section>

      <section v-if="loading" class="status">
        <div class="spinner"></div>
        <p>Loading pets...</p>
      </section>

      <section v-else-if="error" class="status error">
        <p>Error: {{ error }}</p>
        <button class="button" @click="loadPets">Retry</button>
      </section>

      <section v-else-if="selectedPet" class="detail">
        <button class="button secondary" @click="selectedPet = null">&larr; Back</button>
        <article class="pet-detail">
          <h2>{{ selectedPet.name }}</h2>
          <div class="tags">
            <span class="tag" :class="statusClass(selectedPet.status)">
              {{ selectedPet.status }}
            </span>
          </div>
          <p class="category" v-if="selectedPet.category">
            Category: {{ selectedPet.category.name }}
          </p>
          <ul class="photo-list" v-if="selectedPet.photoUrls?.length">
            <li v-for="(url, idx) in selectedPet.photoUrls" :key="idx">{{ url }}</li>
          </ul>
          <p class="tags-row" v-if="selectedPet.tags?.length">
            <span v-for="tag in selectedPet.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
          </p>
          <div class="actions">
            <button class="button" @click="startEdit(selectedPet)">Edit</button>
            <button class="button danger" @click="removePet(selectedPet.id)">Delete</button>
          </div>
        </article>
      </section>

      <section v-else-if="showForm" class="form-section">
        <h2>{{ editPet.id ? 'Edit pet' : 'New pet' }}</h2>
        <form @submit.prevent="submitPet">
          <label>
            Name
            <input v-model="form.name" required />
          </label>
          <label>
            Status
            <select v-model="form.status">
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </label>
          <label>
            Category name
            <input v-model="form.categoryName" />
          </label>
          <label>
            Photo URLs (comma separated)
            <input v-model="form.photoUrls" />
          </label>
          <label>
            Tags (comma separated)
            <input v-model="form.tagsInput" />
          </label>
          <div class="form-actions">
            <button type="button" class="button secondary" @click="closeForm">Cancel</button>
            <button type="submit" class="button primary">Save</button>
          </div>
        </form>
      </section>

      <section v-else-if="pets.length" class="pets-section">
        <div class="pets-grid">
          <article
            v-for="pet in pets"
            :key="pet.id"
            class="pet-card"
            @click="openPet(pet.id)"
          >
            <h3>{{ pet.name }}</h3>
            <span class="tag" :class="statusClass(pet.status)">{{ pet.status }}</span>
            <p class="meta">ID: {{ pet.id }}</p>
          </article>
        </div>
        <div class="pagination">
          <button class="button secondary" :disabled="page === 1" @click="changePage(page - 1)">
            Prev
          </button>
          <span>Page {{ page }}</span>
          <button class="button secondary" @click="changePage(page + 1)">Next</button>
        </div>
      </section>

      <section v-else class="empty">
        <p>No pets found. Try changing filters.</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchPets, fetchPetById, createPet, updatePet, deletePet } from './services/api'

const pets = ref([])
const selectedPet = ref(null)
const searchName = ref('')
const status = ref('available')
const loading = ref(false)
const error = ref(null)
const page = ref(1)
const showForm = ref(false)
const editPet = ref({})
const form = ref({
  name: '',
  status: 'available',
  categoryName: '',
  photoUrls: '',
  tagsInput: '',
})
let searchTimeout = null

const loadPets = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await fetchPets({
      status: status.value,
      name: searchName.value,
      page: page.value,
      limit: 20,
    })
    pets.value = data
  } catch (err) {
    error.value = err.message || 'Failed to fetch pets'
  } finally {
    loading.value = false
  }
}

const openPet = async (id) => {
  loading.value = true
  error.value = null
  try {
    const data = await fetchPetById(id)
    selectedPet.value = data
  } catch (err) {
    error.value = err.message || 'Failed to fetch pet details'
  } finally {
    loading.value = false
  }
}

const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    resetPage()
  }, 500)
}

const resetPage = () => {
  page.value = 1
  loadPets()
}

const changePage = (next) => {
  page.value = next
  loadPets()
}

const openCreateForm = () => {
  editPet.value = {}
  form.value = {
    name: '',
    status: status.value || 'available',
    categoryName: '',
    photoUrls: '',
    tagsInput: '',
  }
  showForm.value = true
}

const startEdit = (pet) => {
  editPet.value = pet
  form.value = {
    name: pet.name || '',
    status: pet.status || 'available',
    categoryName: pet.category?.name || '',
    photoUrls: (pet.photoUrls || []).join(', '),
    tagsInput: (pet.tags || []).map((t) => t.name).join(', '),
  }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
}

const submitPet = async () => {
  const payload = {
    name: form.value.name.trim(),
    status: form.value.status,
    category: form.value.categoryName.trim()
      ? { name: form.value.categoryName.trim() }
      : undefined,
    photoUrls: form.value.photoUrls
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    tags: form.value.tagsInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((name) => ({ name })),
  }

  loading.value = true
  error.value = null
  try {
    if (editPet.value.id) {
      payload.id = Number(editPet.value.id)
      await updatePet(payload)
    } else {
      await createPet(payload)
    }
    showForm.value = false
    loadPets()
  } catch (err) {
    error.value = err.message || 'Failed to save pet'
  } finally {
    loading.value = false
  }
}

const removePet = async (id) => {
  if (!confirm('Delete this pet?')) return
  loading.value = true
  error.value = null
  try {
    await deletePet(id)
    if (selectedPet.value?.id === id) selectedPet.value = null
    loadPets()
  } catch (err) {
    error.value = err.message || 'Failed to delete pet'
  } finally {
    loading.value = false
  }
}

const statusClass = (value) => ({
  available: 'success',
  pending: 'warning',
  sold: 'danger',
})[value] || ''

onMounted(() => {
  loadPets()
})
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: #555;
  margin-top: 0.5rem;
}

.controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.input,
.select,
.button {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ddd;
}

.input {
  flex: 1;
}

.select {
  min-width: 180px;
}

.button {
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.primary {
  background-color: #42b883;
  color: white;
}

.secondary {
  background-color: #e5e7eb;
  color: #111827;
}

.danger {
  background-color: #dc2626;
  color: white;
}

.status {
  text-align: center;
  padding: 3rem 1rem;
}

.status.error {
  color: #c00;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #eee;
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.pet-card {
  padding: 1.25rem;
  border: 1px solid #eee;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.pet-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.pet-card h3 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  color: #2c3e50;
}

.meta {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: #888;
}

.tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  background: #e5e7eb;
  color: #374151;
}

.success {
  background: #d1fae5;
  color: #065f46;
}

.warning {
  background: #fef3c7;
  color: #92400e;
}

.danger {
  background: #fee2e2;
  color: #991b1b;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.detail {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pet-detail {
  margin-top: 1rem;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 0.5rem;
}

.pet-detail h2 {
  margin: 0 0 1rem;
  color: #2c3e50;
}

.category {
  color: #444;
  margin-top: 0.75rem;
}

.photo-list {
  margin-top: 0.75rem;
  padding-left: 1.2rem;
  color: #555;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.form-section {
  max-width: 520px;
  margin: 0 auto;
}

.form-section form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.95rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #888;
}
</style>
