import mongoose, { Schema, model, models } from 'mongoose';

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    destination: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, default: 'Guest Traveler' },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
      text: { type: String, required: true },
      authorId: { type: Schema.Types.ObjectId, ref: 'User' },
      authorName: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Post = models.Post || model('Post', postSchema);

export default Post;
