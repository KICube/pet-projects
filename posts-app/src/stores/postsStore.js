import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([
    { id: 1, title: 'Первый пост', description: 'Описание первого поста' },
    { id: 2, title: 'Второй пост', description: 'Описание второго поста' }
  ])
  let nextId = 3

  const postsCount = computed(() => posts.value.length)
  
  const getPostById = (id) => {
    return posts.value.find(post => post.id === Number(id))
  }

  const addPost = (title, description) => {
    posts.value.push({
      id: nextId++,
      title,
      description
    })
  }

  const deletePost = (id) => {
    posts.value = posts.value.filter(post => post.id !== id)
  }

  return {
    posts,
    postsCount,
    getPostById,
    addPost,
    deletePost
  }
})