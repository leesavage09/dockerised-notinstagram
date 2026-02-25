# t.integer "author_id", null: false
# t.string "caption", limit: 2200
# t.string "image_key", null: false
# t.string "image_url"
# t.datetime "created_at", precision: 6, null: false
# t.datetime "updated_at", precision: 6, null: false
# t.index ["author_id"], name: "index_posts_on_author_id"
# t.index ["created_at"], name: "index_posts_on_created_at"

class Post < ApplicationRecord
  before_validation :ensure_image_key

  validates :caption,
            length: { maximum: 2200, message: "Post captions must under 2200 characters" }
  validates :author,
            presence: { message: "The post must have an author" }
  validate :validate_post_max_taggings

  belongs_to :author,
             class_name: "User",
             foreign_key: :author_id

  has_many :taggings,
           class_name: "Tagging",
           foreign_key: :post_id,
           dependent: :destroy

  has_many :hashtags,
           through: :taggings,
           source: :hashtag

  has_many :likes, -> { where liked_type: "Post" },
           class_name: "Like",
           foreign_key: :liked_id,
           dependent: :destroy

  has_many :comments, -> { where(parent_type: "Post").order(created_at: :asc) },
           class_name: "Comment",
           foreign_key: :parent_id,
           dependent: :destroy

  def validate_post_max_taggings
    errors.add(:max_taggings, "A post can only be tagged a maximum of 30 times") if taggings.size > 30
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
    Rails.root.join("public", "uploads", "post")
  end

  class << self
    def generate_image_key
      loop do
        key = SecureRandom::uuid
        break key unless Post.where(image_key: key).exists?
      end
    end

    def get_details_by_post_id(post_id)
      post = Post.find_by(id: post_id)
      post_ids, post_comments, associated_user_ids = get_associated_details([post])

      return post, post_comments, User.where(id: associated_user_ids)
    end

    def get_details_by_author(author_id, limit, offset)
      posts = Post
        .includes(:likes, :comments)
        .where(author_id: author_id)
        .order(created_at: :desc)
        .limit(limit).offset(offset)
      number_posts = Post.select(:id).where(author_id: author_id).count

      post_ids, post_comments, associated_user_ids = get_associated_details(posts)
      return posts, number_posts, post_ids, post_comments, User.where(id: associated_user_ids)
    end

    def get_details_by_hashtag(hashtag_id, limit, offset)
      taggings = Tagging.includes(post: [:likes, :comments]).where(hashtag_id: hashtag_id).order("created_at DESC").limit(limit).offset(offset)
      number_posts = Tagging.select(:id).where(hashtag_id: hashtag_id).count
      posts = []
      taggings.each { |tag|
        posts << tag.post
      }

      post_ids, post_comments, associated_user_ids = get_associated_details(posts)
      return posts, number_posts, post_ids, post_comments, User.where(id: associated_user_ids)
    end

    def get_associated_details(posts)
      post_comments = []
      associated_user_ids = []
      post_ids = []

      posts.each do |post|
        post_ids << post.id

        associated_user_ids << post.author_id

        post.likes.each do |like|
          associated_user_ids << like.liker_id
        end

        post.comments.each do |comment|
          post_comments << comment
          associated_user_ids << comment.author_id
        end
      end

      return post_ids, post_comments, associated_user_ids
    end
  end
end
