<template>
  <div class="app">
    <header class="app-header">
      <h1>Cat Facts Explorer</h1>
      <p class="subtitle">Discover interesting facts about cats</p>
    </header>

    <main class="app-main">
      <section class="controls">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search facts..."
          class="input"
          @input="onSearchInput"
        />
        <button class="button primary" @click="loadRandomFact">Random fact</button>
        <button class="button secondary" @click="toggleFavorites">
          {{ showFavorites ? 'All facts' : 'Favorites' }}
        </button>
      </section>

      <section v-if="loading" class="status">
        <div class="spinner"></div>
        <p>Loading facts...</p>
      </section>

      <section v-else-if="error" class="status error">
        <p>Error: {{ error }}</p>
        <button class="button" @click="loadFacts">Retry</button>
      </section>

      <section v-else-if="selectedFact" class="detail">
        <button class="button secondary" @click="selectedFact = null">&larr; Back</button>
        <article class="fact-detail">
          <p class="fact-text">{{ selectedFact.fact }}</p>
          <div class="fact-meta">
            <span>Length: {{ selectedFact.length }}</span>
          </div>
          <button
            class="button"
            :class="isFavorite(selectedFact) ? 'danger' : 'primary'"
            @click="toggleFavorite(selectedFact)"
          >
            {{ isFavorite(selectedFact) ? 'Remove from favorites' : 'Add to favorites' }}
          </button>
        </article>
      </section>

      <section v-else-if="facts.length" class="facts-section">
        <div class="facts-list">
          <article
            v-for="fact in facts"
            :key="fact.fact + fact.length"
            class="fact-card"
            @click="openFact(fact)"
          >
            <p>{{ fact.fact }}</p>
            <div class="fact-card-meta">
              <span>Length: {{ fact.length }}</span>
              <button
                class="icon-button"
                :class="isFavorite(fact) ? 'active' : ''"
                @click.stop="toggleFavorite(fact)"
                title="Favorite"
              >
                ★
              </button>
            </div>
          </article>
        </div>
        <div class="pagination">
          <button class="button secondary" :disabled="page === 1" @click="changePage(page - 1)">
            Prev
          </button>
          <span>Page {{ page }} of {{ lastPage }}</span>
          <button class="button secondary" :disabled="page === lastPage" @click="changePage(page + 1)">
            Next
          </button>
        </div>
      </section>

      <section v-else class="empty">
        <p>No facts found. Try a different search query.</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchFacts, fetchRandomFact } from './services/api'

const facts = ref([])
const selectedFact = ref(null)
const searchQuery = ref('')
const loading = ref(false)
const error = ref(null)
const page = ref(1)
const lastPage = ref(1)
const favorites = ref([])
const showFavorites = ref(false)
let searchTimeout = null

const favoritesKey = 'cat-facts-favorites'

const loadFavorites = () => {
  try {
    const raw = localStorage.getItem(favoritesKey)
    favorites.value = raw ? JSON.parse(raw) : []
  } catch {
    favorites.value = []
  }
}

const saveFavorites = () => {
  localStorage.setItem(favoritesKey, JSON.stringify(favorites.value))
}

const isFavorite = (fact) => {
  return favorites.value.some((item) => item.fact === fact.fact && item.length === fact.length)
}

const toggleFavorite = (fact) => {
  const idx = favorites.value.findIndex((item) => item.fact === fact.fact && item.length === fact.length)
  if (idx === -1) {
    favorites.value.push(fact)
  } else {
    favorites.value.splice(idx, 1)
  }
  saveFavorites()
}

const loadFacts = async () => {
  loading.value = true
  error.value = null
  try {
    const result = await fetchFacts({ page: page.value, limit: 20 })
    facts.value = result.items
    lastPage.value = result.lastPage
  } catch (err) {
    error.value = err.message || 'Failed to fetch facts'
  } finally {
    loading.value = false
  }
}

const openFact = (fact) => {
  selectedFact.value = fact
}

const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    applyFilter()
  }, 400)
}

const applyFilter = () => {
  if (!searchQuery.value.trim()) {
    loadFacts()
    return
  }
  const q = searchQuery.value.trim().toLowerCase()
  const filtered = favorites.value.filter((fact) => fact.fact.toLowerCase().includes(q))
  facts.value = filtered
  lastPage.value = 1
  page.value = 1
}

const changePage = (next) => {
  page.value = next
  if (searchQuery.value.trim()) {
    applyFilter()
  } else {
    loadFacts()
  }
}

const loadRandomFact = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await fetchRandomFact()
    selectedFact.value = data
  } catch (err) {
    error.value = err.message || 'Failed to fetch random fact'
  } finally {
    loading.value = false
  }
}

const toggleFavorites = () => {
  showFavorites.value = !showFavorites.value
  if (showFavorites.value) {
    searchQuery.value = ''
    facts.value = favorites.value
    lastPage.value = 1
    page.value = 1
  } else {
    loadFacts()
  }
}

onMounted(() => {
  loadFavorites()
  loadFacts()
})
</script>

<style scoped>
.app {
  max-width: 900px;
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
.button {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ddd;
}

.input {
  flex: 1;
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

.facts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fact-card {
  padding: 1.25rem;
  border: 1px solid #eee;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.fact-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.fact-card p {
  margin: 0;
  color: #333;
  line-height: 1.6;
}

.fact-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #888;
}

.icon-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s;
}

.icon-button.active {
  color: #f59e0b;
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

.fact-detail {
  margin-top: 1rem;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 0.5rem;
}

.fact-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #333;
  white-space: pre-wrap;
}

.fact-meta {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #888;
}

.empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #888;
}
</style>
