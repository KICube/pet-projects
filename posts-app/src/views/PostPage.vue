<template>
  <div class="post-page">
    <div v-if="post">
      <RouterLink :to="{ name: 'posts' }" class="back-link">
        ← Назад к списку
      </RouterLink>
      
      <h1>{{ post.title }}</h1>
      <div class="post-content">
        <p>{{ post.description || 'Описание отсутствует' }}</p>
      </div>
      <p class="post-id">ID поста: {{ post.id }}</p>
    </div>

    <div v-else class="not-found">
      <h2>Пост не найден</h2>
      <p>Возможно, он был удалён.</p>
      <RouterLink :to="{ name: 'posts' }" class="btn">
        Вернуться к постам
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { usePostsStore } from '@/stores/postsStore'

const route = useRoute()
const postsStore = usePostsStore()

const post = computed(() => postsStore.getPostById(route.params.id))
</script>

<style scoped>
.post-page {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.back-link {
  display: inline-block;
  margin-bottom: 20px;
  color: #42b883;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.post-content {
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 6px;
  line-height: 1.6;
}

.post-id {
  color: #999;
  font-size: 0.9em;
}

.not-found {
  text-align: center;
  padding: 40px;
}

.not-found h2 {
  margin-bottom: 15px;
  color: #e74c3c;
}

.btn {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 24px;
  background: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 6px;
}

.btn:hover {
  background: #359970;
}
</style>