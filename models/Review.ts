import mongoose, { Schema, model, models } from 'mongoose';

const reviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: false } // Admin moderation support
  },
  { timestamps: true }
);

// Prevent users from leaving multiple reviews on the same package
reviewSchema.index({ userId: 1, packageId: 1 }, { unique: true });

const Review = models.Review || model('Review', reviewSchema);

export default Review;
