# get     'users', to: 'users#index', as: 'users'
# get     'users/new', to: 'users#new',  as: 'new_user'
# get     'users/:id/edit', to: 'users#edit', as: 'edit_user'
# get     'users/:id', to: 'users#show', as: 'show_user'
# post    'users', to: 'users#create',  as: 'create_user'
# patch   'users/:id', to: 'users#update', as: 'update_user_1'
# put     'users/:id', to: 'users#update',  as: 'update_user_2'
# delete  'users/:id', to: 'users#destroy',  as: 'destroy_user'

# For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
Rails.application.routes.draw do
  namespace :api do
    resources :users, only: [:index, :create, :update]
    resources :users, only: [:show] do
      resources :follows, only: [:index]
    end

    resource :session, only: [:create, :destroy]
    post "session/upload_avatar", to: "sessions#upload_avatar", as: "upload_avatar"

    resources :hashtags, only: [:show]

    resources :follows, only: [:create, :destroy]

    resources :posts, only: [:index, :create, :update, :destroy]

    resources :posts, only: [:show] do
      resources :likes, only: [:create, :destroy]
    end

    resources :notifications, only: [:index]

    resources :comments, only: [:create]

  end

  get "*page", to: "static#index", constraints: ->(req) do
                 !req.xhr? && req.format.html?
               end

  root "static#index"
end
