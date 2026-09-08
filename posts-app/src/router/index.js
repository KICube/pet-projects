import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import PostsPage from '@/views/PostsPage.vue'
import PostPage from '@/views/PostPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta: { title: 'Главная' }
    },
    {
      path: '/posts',
      name: 'posts',
      component: PostsPage,
      meta: { title: 'Все посты' }
    },
    {
      path: '/posts/:id',
      name: 'post',
      component: PostPage,
      meta: { title: 'Пост' }
    }
  ]
})

router.beforeEach((to) => {
  if (to.name === 'post') {
    document.title = `${to.meta.title} #${to.params.id}`
  } else if (to.meta.title) {
    document.title = to.meta.title
  }
})

export default router