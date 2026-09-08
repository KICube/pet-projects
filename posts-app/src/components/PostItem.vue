<template>
  <div class="post-item">
    <div class="post-info">
      <h3>{{ post.title }}</h3>
      <p>{{ post.description }}</p>
    </div>
    <div class="post-actions">
      <RouterLink 
        :to="{ name: 'post', params: { id: post.id } }" 
        class="btn-view"
      >
        Просмотр
      </RouterLink>
      <button @click="$emit('delete')" class="btn-delete">
        Удалить
      </button>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  post: {
    type: Object,
    required: true
  }
})

defineEmits(['delete'])
</script>

<style scoped>
.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-bottom: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #42b883;
  transition: transform 0.2s;
}

.post-item:hover {
  transform: translateX(5px);
}

.post-info {
  flex: 1;
}

.post-info h3 {
  margin-bottom: 8px;
  color: #333;
}

.post-info p {
  color: #666;
  font-size: 0.95em;
}

.post-actions {
  display: flex;
  gap: 10px;
}

.btn-view {
  padding: 8px 16px;
  background: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
}

.btn-view:hover {
  background: #359970;
}

.btn-delete {
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-delete:hover {
  background: #c0392b;
}
</style>