import mongoose, { Schema, model, models } from 'mongoose';

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info'
    },
    relatedApplicationId: { type: Schema.Types.ObjectId, ref: 'Application', default: null }
  },
  { timestamps: true }
);

const Notification = models.Notification || model('Notification', notificationSchema);

export default Notification;
