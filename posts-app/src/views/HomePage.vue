<template>
  <div class="home">
    <h1>Добро пожаловать!</h1>
    <p>Это простое приложение для управления постами.</p>
    <p>Всего постов: <strong>{{ postsStore.postsCount }}</strong></p>
    <RouterLink :to="{ name: 'posts' }" class="btn">
      Перейти к постам →
    </RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { usePostsStore } from '@/stores/postsStore'

const postsStore = usePostsStore()
</script>

<style scoped>
.home {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

h1 {
  margin-bottom: 20px;
  color: #42b883;
}

p {
  margin-bottom: 15px;
  color: #666;
}

.btn {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 24px;
  background: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.3s;
}

.btn:hover {
  background: #359970;
}
</style>