import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'

export function createSimpelAsyncThunk(name, apiUtilFunciton) {
  return createAsyncThunk(
    name,
    async (args, thunkAPI) => {
      const argsArray = Array.isArray(args) ? args : [args]
      try {
        const response = await apiUtilFunciton(...argsArray)
        return response.data
      }
      catch (e) {
        return thunkAPI.rejectWithValue(e)
      }
    }
  )
}

export function loginUser(user) {
  return axios.post('/api/session/', {
    user
  }, { withCredentials: true })
}

export function logoutUser() {
  return axios.delete('/api/session/',
    {},
    { withCredentials: true })
}

export function uploadAvatar(imageBlob) {
  const formData = new FormData()
  formData.append('image', imageBlob, 'avatar.jpg')
  return axios.post('/api/session/upload_avatar', formData, {
    headers: { 'content-type': 'multipart/form-data' }
  })
}

export function createUser(user) {
  return axios.post('/api/users/', { user: user })
}

export function updateUser(user) {
  return axios.patch(`/api/users/${user.id}`, { user: user })
}

export function findUser(queryString) {
  return axios.get('/api/users?q=' + encodeURI(queryString))
}

export function getUserDetails(id) {
  return axios.get('/api/users/' + encodeURI(id))
}

export function getFollowers(user_id) {
  return axios.get('/api/users/' + encodeURI(user_id) + '/follows?type=followers')
}

export function getFollowings(user_id) {
  return axios.get('/api/users/' + encodeURI(user_id) + '/follows?type=followed_users')
}

export function getHashtagDetails(hashtag_name) {
  return axios.get('/api/hashtags/' + encodeURI(hashtag_name))
}

export function followUser(user_id) {
  return axios.post('/api/follows', { user_id: user_id })
}

export function unfollowUser(user_id) {
  return axios.delete('/api/follows/' + encodeURI(user_id), { data: { followed_type: "User" } })
}

export function followHashtag(hashtag_id) {
  return axios.post('/api/follows', { hashtag_id: hashtag_id })
}

export function unfollowHashtag(hashtag_id) {
  return axios.delete('/api/follows/' + encodeURI(hashtag_id), { data: { followed_type: "Hashtag" } })
}

export function createPost(arg) {
  const formData = new FormData()
  formData.append('caption', arg.caption)
  if (arg.image) {
    formData.append('image', arg.image, 'post.jpg')
  }
  return axios.post('/api/posts', formData, {
    headers: { 'content-type': 'multipart/form-data' }
  })
}

export function updatePost(arg) {
  return axios.patch(`/api/posts/${arg.id}`, { caption: arg.caption })
}

export function destroyPost(arg) {
  return axios.delete('/api/posts/' + arg.id)
}

export function showPost(arg) {
  return axios.get(`/api/posts/${arg.id}`)
}

export function likePost(arg) {
  return axios.post(`/api/posts/${arg.id}/likes`)
}

export function unlikePost(arg) {
  return axios.delete(`/api/posts/${arg.id}/likes/1`)
}

export function getFeed(arg) {
  return axios.get(`/api/posts?type=feed&page=${arg.page}`)
}

export function getRandomPosts() {
  return axios.get(`/api/posts?type=discover`)
}

export function getNotifications() {
  return axios.get(`/api/notifications`)
}

export function createComment(arg) {
  return axios.post(`/api/comments`, arg)
}

export function discoverUsers() {
  return axios.get(`/api/users`)
} 