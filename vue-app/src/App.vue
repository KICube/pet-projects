<template>
  <div class="app">
    <header class="app-header">
      <h1>Posts Explorer</h1>
      <p class="subtitle">Search and explore posts from JSONPlaceholder</p>
    </header>

    <main class="app-main">
      <section class="search-section">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search posts by title..."
          class="search-input"
          @input="onSearchInput"
        />
        <button class="search-button" @click="loadPosts">Search</button>
        <button class="reset-button" @click="resetSearch">Reset</button>
      </section>

      <section v-if="loading" class="status-section">
        <div class="spinner"></div>
        <p>Loading posts...</p>
      </section>

      <section v-else-if="error" class="status-section error">
        <p>Error: {{ error }}</p>
        <button class="retry-button" @click="loadPosts">Retry</button>
      </section>

      <section v-else-if="selectedPost" class="detail-section">
        <button class="back-button" @click="selectedPost = null">
          &larr; Back to list
        </button>
        <article class="post-detail">
          <h2>{{ selectedPost.title }}</h2>
          <p class="post-body">{{ selectedPost.body }}</p>
          <div class="post-meta">
            <span>Post ID: {{ selectedPost.id }}</span>
            <span>User ID: {{ selectedPost.userId }}</span>
          </div>
        </article>
      </section>

      <section v-else-if="posts.length" class="posts-section">
        <div class="posts-grid">
          <article
            v-for="post in posts"
            :key="post.id"
            class="post-card"
            @click="openPost(post.id)"
          >
            <h3>{{ post.title }}</h3>
            <p>{{ post.body.slice(0, 120) }}{{ post.body.length > 120 ? '...' : '' }}</p>
            <span class="post-id">ID: {{ post.id }}</span>
          </article>
        </div>
      </section>

      <section v-else class="empty-state">
        <p>No posts found. Try a different search query.</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchPosts, fetchPostById } from './services/api'

const posts = ref([])
const selectedPost = ref(null)
const searchQuery = ref('')
const loading = ref(false)
const error = ref(null)
let searchTimeout = null

const loadPosts = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await fetchPosts(searchQuery.value.trim())
    posts.value = data
  } catch (err) {
    error.value = err.message || 'Failed to fetch posts'
  } finally {
    loading.value = false
  }
}

const openPost = async (id) => {
  loading.value = true
  error.value = null
  try {
    const data = await fetchPostById(id)
    selectedPost.value = data
  } catch (err) {
    error.value = err.message || 'Failed to fetch post details'
  } finally {
    loading.value = false
  }
}

const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadPosts()
  }, 500)
}

const resetSearch = () => {
  searchQuery.value = ''
  selectedPost.value = null
  loadPosts()
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: #666;
  margin-top: 0.5rem;
}

.search-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
}

.search-button,
.reset-button,
.retry-button,
.back-button {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  background-color: #42b883;
  color: white;
  transition: background-color 0.2s;
}

.search-button:hover,
.reset-button:hover,
.retry-button:hover,
.back-button:hover {
  background-color: #33a06f;
}

.reset-button {
  background-color: #666;
}

.status-section {
  text-align: center;
  padding: 3rem 1rem;
}

.status-section.error {
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

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.post-card {
  padding: 1.25rem;
  border: 1px solid #eee;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.post-card h3 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  color: #2c3e50;
}

.post-card p {
  margin: 0;
  color: #555;
  line-height: 1.5;
}

.post-id {
  display: inline-block;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #999;
}

.detail-section {
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

.post-detail {
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 0.5rem;
}

.post-detail h2 {
  margin: 0 0 1rem;
  color: #2c3e50;
}

.post-body {
  line-height: 1.7;
  color: #333;
  white-space: pre-wrap;
}

.post-meta {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: #888;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #888;
}
</style>
