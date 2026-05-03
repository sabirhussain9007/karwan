import mongoose, { Schema, model, models } from 'mongoose';

const packageSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: 0 },
    durationDays: { type: Number, required: true },
    destinations: { type: [String], required: true },
    imageUrl: { type: String, default: '' },
    itinerary: [
      {
        day: { type: Number },
        activity: { type: String }
      }
    ],
    includes: { type: [String], default: [] },
    excludes: { type: [String], default: [] },
    category: { type: String, enum: ['Tour', 'Accommodation', 'Car Rental', 'Umrah', 'Hajj', 'International Tours', 'Domestic Tours', 'Visa Services', 'Ticketing'], default: 'Tour' },
    serviceType: { type: String, default: '' }, // Additional service type info
    isDraft: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    ratingsInfo: {
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

const Package = models.Package || model('Package', packageSchema);

export default Package;
