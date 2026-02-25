# t.string "name", limit: 30
# t.string "username", limit: 30, null: false
# t.string "bio", limit: 150
# t.string "email", limit: 254, null: false
# t.string "password_digest", null: false
# t.string "session_token", null: false
# t.string "image_key", null: false
# t.string "image_url"
# t.datetime "created_at", precision: 6, null: false
# t.datetime "updated_at", precision: 6, null: false
# t.index ["email"], name: "index_users_on_email", unique: true
# t.index ["image_key"], name: "index_users_on_image_key", unique: true
# t.index ["name"], name: "index_users_on_name"
# t.index ["session_token"], name: "index_users_on_session_token", unique: true
# t.index ["username"], name: "index_users_on_username", unique: true

class User < ApplicationRecord
  validates :name,
            length: { maximum: 30, message: "Name must be less than 30 characters" }
  validates :username,
            presence: { message: "You must choose a username" },
            uniqueness: { message: "This username has already been taken", case_sensitive: false },
            length: { maximum: 30, message: "Username must be less than 30 characters" },
            format: { with: /\A[\w.]+\z/, message: "Username can only use letters, numbers, underscores and periods" }
  validates :bio,
            length: { maximum: 150, message: "Bio must be under 150 characters" }
  validates :email,
            presence: { message: "You must have an email address" },
            uniqueness: { message: "Email address has already signed up" },
            length: { maximum: 254, message: "Email is not in a valid format" },
            format: { with: URI::MailTo::EMAIL_REGEXP, message: "Email is not in a valid format" }
  validates :session_token,
            presence: true,
            uniqueness: true
  validates :image_key,
            presence: true,
            uniqueness: true
  validates :password_digest,
            presence: true
  validates :password,
            length: { minimum: 6, allow_nil: true, message: "Password must be at least 6 characters long" }

  has_many :posts,
           class_name: "Post",
           foreign_key: :author_id

  has_many :notifications,
    class_name: "Notification",
    foreign_key: :notified_user

  has_many :inward_follows, -> { where followed_type: "User" },
    class_name: "Follow",
    foreign_key: :followed_id

  has_many :outward_follows,
    class_name: "Follow",
    foreign_key: :follower_id

  has_many :followers,
           through: :inward_follows,
           source: :follower

  has_many :followed_users,
           through: :outward_follows,
           source_type: "User",
           source: :followed

  has_many :followed_hashtags,
           through: :outward_follows,
           source_type: "Hashtag",
           source: :followed

  before_validation :ensure_session_token
  before_validation :ensure_image_key

  attr_reader :password

  def password=(password)
    @password = password
    self.password_digest = BCrypt::Password.create(password)
  end

  def reset_session_token!
    self.session_token = User.generate_session_token
    self.save!
    self.session_token
  end

  def ensure_session_token
    self.session_token ||= User.generate_session_token
  end

  def ensure_image_key
    self.image_key ||= User.generate_image_key
  end

  def image_url
    return nil unless self[:image_url]
    return self[:image_url] if self[:image_url].start_with?("http")
    "/uploads/" + self[:image_url]
  end

  def upload_dir
    Rails.root.join("public", "uploads", "avatar")
  end

  class << self
    def find_by_credentials(username, password)
      user = User.where("lower(username) = ?", username.downcase).first
      return user if user && BCrypt::Password.new(user.password_digest).is_password?(password)
      nil
    end

    def generate_session_token
      loop do
        token = SecureRandom::urlsafe_base64(16)
        break token unless User.where(session_token: token).exists?
      end
    end

    def generate_image_key
      loop do
        key = SecureRandom::uuid
        break key unless User.where(image_key: key).exists?
      end
    end
  end
end
