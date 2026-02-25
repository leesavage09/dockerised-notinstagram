import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as ApiUtil from '../../util/api'
import { imageEditorSelector } from '../slice/image_editor_slice'
import { Utilitys as ImageUtil } from '../../util/image'
import { profileActions } from '../slice/profile_slice'
import { followersActions } from '../slice/followers_slice'

const slice_name = 'session'

const login = ApiUtil.createSimpelAsyncThunk(
    `${slice_name}/login`,
    ApiUtil.loginUser
)

const logout = ApiUtil.createSimpelAsyncThunk(
    `${slice_name}/logout`,
    ApiUtil.logoutUser
)

const createUser = ApiUtil.createSimpelAsyncThunk(
    `${slice_name}/createUser`,
    ApiUtil.createUser
)

const updateUser = ApiUtil.createSimpelAsyncThunk(
    `${slice_name}/updateUser`,
    ApiUtil.updateUser
)

const updatePassword = createAsyncThunk(
    `${slice_name}/updatePassword`,
    async ({ user, oldPassword, newPassword, newPasswordConfirmation }, thunkAPI) => {
        if (newPassword !== newPasswordConfirmation) {
            return thunkAPI.rejectWithValue("Make sure both passwords match")
        }
        try {
            await ApiUtil.loginUser({
                username: user.username,
                password: oldPassword
            })
            const responce = await ApiUtil.updateUser({ ...user, password: newPassword })

            return responce.data
        } catch (e) {
            if (e.message.includes("401")) {
                return thunkAPI.rejectWithValue("Your old password was entered incorrectly")
            }
            else {
                return thunkAPI.rejectWithValue(e)
            }
        }
    }
)

const updateAvatar = createAsyncThunk(
    `${slice_name}/updateAvatar`,
    async (arg, thunkAPI) => {
        try {
            const img = imageEditorSelector.processedImage()(thunkAPI.getState())
            const imageBlob = await ImageUtil.createFileWithImage(img)
            const response = await ApiUtil.uploadAvatar(imageBlob)
            return response.data
        }
        catch (e) {
            return thunkAPI.rejectWithValue(e)
        }
    }
)

const removeAvatar = createAsyncThunk(
    `${slice_name}/removeAvatar`,
    async (arg, thunkAPI) => {
        try {
            const user = sessionSelector.loggedInUser()(thunkAPI.getState())
            const responce = await ApiUtil.updateUser({ ...user, image_url: null })
            return responce.data
        }
        catch (e) {
            return thunkAPI.rejectWithValue(e)
        }
    }
)

const getNotifications = ApiUtil.createSimpelAsyncThunk(
    `${slice_name}/getNotifications`,
    ApiUtil.getNotifications
)

const sessionSlice = createSlice({
    name: slice_name,
    initialState: {
        user: null,
        notifications: []
    },
    reducers: {
        reauthenticate: resetUser
    },
    extraReducers: {
        [login.fulfilled]: setUser,
        [createUser.fulfilled]: setUser,
        [updateUser.fulfilled]: setUser,
        [updatePassword.fulfilled]: setUser,
        [updateAvatar.fulfilled]: setUser,
        [removeAvatar.fulfilled]: setUser,

        [logout.fulfilled]: resetUser,

        [profileActions.fetchUserActivityDetails.fulfilled]: (state, action) => updateUserState(state, action.payload.user),

        [followersActions.followUser.fulfilled]: (state, action) => updateUserState(state, action.payload),
        [followersActions.unfollowUser.fulfilled]: (state, action) => updateUserState(state, action.payload),
        [followersActions.followHashtag.fulfilled]: (state, action) => updateUserState(state, action.payload),
        [followersActions.unfollowHashtag.fulfilled]: (state, action) => updateUserState(state, action.payload),

        [getNotifications.fulfilled]: (state, action) => { state.notifications = action.payload.notifications },
    }
})
export default sessionSlice

function setUser(state, action) {
    state.user = action.payload
}

function resetUser(state) {
    state.user = null
}

function updateUserState(state, user) {
    if (user.id === state.user.id) {
        Object.assign(state.user, user);
    }
}

sessionSlice.actions.login = login
sessionSlice.actions.createUser = createUser
sessionSlice.actions.updateUser = updateUser
sessionSlice.actions.updatePassword = updatePassword
sessionSlice.actions.updateAvatar = updateAvatar
sessionSlice.actions.removeAvatar = removeAvatar
sessionSlice.actions.logout = logout
sessionSlice.actions.getNotifications = getNotifications

export const sessionActions = sessionSlice.actions

export const sessionSelector = {
    loggedInUser: () => state => state[slice_name].user,
    getNotifications: () => state => {
        if (!state[slice_name].notifications) {
            return []
        }
        const notes = []
        Object.keys(state[slice_name].notifications).forEach(note => {
            notes.push(state[slice_name].notifications[note])
        });
        return notes
    }
}