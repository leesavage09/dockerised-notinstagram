import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as ApiUtil from '../../util/api'
import { imageEditorSelector } from './image_editor_slice'
import { Utilitys as ImageUtil } from '../../util/image'

const slice_name = 'post'

const createPost = createAsyncThunk(
    `${slice_name}/createPost`,
    async (arg, thunkAPI) => {
        try {
            const img = imageEditorSelector.processedImage()(thunkAPI.getState())
            const imageBlob = await ImageUtil.createFileWithImage(img)
            const response = await ApiUtil.createPost({ caption: arg.caption, image: imageBlob })
            return response.data
        }
        catch (e) {
            return thunkAPI.rejectWithValue(e)
        }
    }
)

const showPost = ApiUtil.createSimpelAsyncThunk(
    `${slice_name}/showPost`,
    ApiUtil.showPost
)

const likePost = ApiUtil.createSimpelAsyncThunk(
    `${slice_name}/likePost`,
    ApiUtil.likePost
)

const unlikePost = ApiUtil.createSimpelAsyncThunk(
    `${slice_name}/unlikePost`,
    ApiUtil.unlikePost
)

const PostSlice = createSlice({
    name: slice_name,
    initialState: {
        loading: false,
        post_id: null,
    },
    reducers: {
        startNewPost: resetState,
    },
    extraReducers: {
        [createPost.pending]: loadingTrue,
        [createPost.fulfilled]: postCreated,
        [createPost.rejected]: loadingFalse,
    }
})

export default PostSlice

PostSlice.actions.createPost = createPost
PostSlice.actions.showPost = showPost
PostSlice.actions.likePost = likePost
PostSlice.actions.unlikePost = unlikePost
export const PostActions = PostSlice.actions

export const PostSelector = {
    created_post_id: () => state => state[slice_name].post_id,
    loading: () => state => state[slice_name].loading
}

function postCreated(state, action) {
    state.loading = false
    state.post_id = action.payload.post.id
}
function loadingFalse(state) {
    state.loading = false
}
function loadingTrue(state) {
    state.loading = true
}
function resetState(state) {
    state.loading = false
    state.post_id = null
}