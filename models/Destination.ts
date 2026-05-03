import mongoose, { Schema, model, models } from 'mongoose';

const destinationSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    // E.g., 'linear-gradient(135deg, #f59e0b, #d97706)'
    colorGradient: { type: String, default: 'linear-gradient(135deg, #3b82f6, #2563eb)' } 
  },
  { timestamps: true }
);

const Destination = models.Destination || model('Destination', destinationSchema);

export default Destination;
