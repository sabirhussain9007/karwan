import mongoose, { Schema, model, models } from 'mongoose';

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: Schema.Types.ObjectId, ref: 'Package' },
    serviceType: {
      type: String,
      enum: ['Umrah', 'Hajj', 'International Tours', 'Domestic Tours', 'Visa Services', 'Ticketing', 'Car Rental', 'Tour'],
      default: 'Tour'
    },
    status: { 
      type: String, 
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], 
      default: 'Pending' 
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partial', 'Paid', 'Refunded'],
      default: 'Unpaid'
    },
    paymentId: { type: String }, // Stripe or other gateway reference
    totalAmount: { type: Number, required: true },
    bookingDate: { type: Date, required: true },
    travelDate: { type: Date },
    returnDate: { type: Date },
    passengers: { type: Number, default: 1 },
    specialRequests: { type: String, default: '' },
    stripeSessionId: { type: String }
  },
  { timestamps: true }
);

const Booking = models.Booking || model('Booking', bookingSchema);

export default Booking;
