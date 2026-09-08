<template>
  <div class="posts-page">
    <h1>Все посты</h1>

    <div class="form">
      <h2>Создать новый пост</h2>
      <input 
        v-model="newPost.title" 
        type="text" 
        placeholder="Заголовок"
      />
      <textarea 
        v-model="newPost.description" 
        placeholder="Описание"
        rows="3"
      ></textarea>
      <button @click="createPost" class="btn">
        Добавить пост
      </button>
    </div>

    <div class="posts-list">
      <h2>Список постов ({{ postsStore.postsCount }})</h2>
      <div v-if="postsStore.posts.length === 0" class="empty">
        Постов пока нет. Создайте первый!
      </div>
      <PostItem 
        v-for="post in postsStore.posts" 
        :key="post.id" 
        :post="post"
        @delete="postsStore.deletePost(post.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { usePostsStore } from '@/stores/postsStore'
import PostItem from '@/components/PostItem.vue'

const postsStore = usePostsStore()

const newPost = reactive({
  title: '',
  description: ''
})

const createPost = () => {
  if (!newPost.title.trim()) {
    alert('Введите заголовок!')
    return
  }
  
  postsStore.addPost(newPost.title, newPost.description)
  
  newPost.title = ''
  newPost.description = ''
}
</script>

<style scoped>
.posts-page {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
  margin-bottom: 30px;
  color: #42b883;
}

.form {
  margin-bottom: 40px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 6px;
}

.form h2 {
  margin-bottom: 15px;
  font-size: 1.2em;
}

input, textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.btn {
  padding: 10px 20px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.btn:hover {
  background: #359970;
}

.posts-list h2 {
  margin-bottom: 20px;
  font-size: 1.2em;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>