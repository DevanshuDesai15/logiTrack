import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: [true, 'Product reference is required'],
    },
    change: {
      type: Number,
      required: [true, 'Change amount is required'],
      // Positive for addition, negative for reduction
    },
    reason: {
      type: String,
      enum: ['order', 'manual-adjustment', 'return', 'other'],
      default: 'manual-adjustment',
    },
    reasonDetails: {
      type: String,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      // Required only if reason is 'order' or 'return'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

export default InventoryLog; 