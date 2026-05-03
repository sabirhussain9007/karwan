import mongoose, { Schema, model, models } from 'mongoose';

const applicationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    serviceType: {
      type: String,
      enum: ['Umrah', 'Hajj', 'International Tours', 'Domestic Tours', 'Visa Services', 'Ticketing', 'Car Rental'],
      required: true
    },
    packageId: { type: Schema.Types.ObjectId, ref: 'Package', default: null },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Under Review'],
      default: 'Pending'
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partial', 'Paid', 'Refunded'],
      default: 'Unpaid'
    },
    paymentId: { type: String }, // Stripe reference
    applicationData: {
      fullName: String,
      email: String,
      phone: String,
      nationality: String,
      passport: String,
      dateOfBirth: Date,
      travelDate: Date,
      returnDate: Date,
      numberOfPassengers: { type: Number, default: 1 },
      passengers: [{
        name: String,
        relation: String,
        dateOfBirth: Date,
        passport: String
      }],
      specialRequests: String,
      visaRequired: Boolean,
      hotelPreference: String,
      mealPlan: String,
      transportPreference: String,
      additionalNotes: String,
      documents: [{
        documentType: String,
        url: String
      }]
    },
    totalAmount: { type: Number, required: true },
    appliedDate: { type: Date, default: Date.now },
    approvalDate: Date,
    rejectionReason: String,
    adminNotes: String,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const Application = models.Application || model('Application', applicationSchema);

export default Application;
