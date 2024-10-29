//{ timestamps: true }
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Store owner fulfilling the order
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
    },
    Orders: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        priceAtPurchase: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "out_for_delivery", "completed", "cancelled"],
      default: "pending",
    },

    deliveryDetails: {
      address: String,
      contactPhone: String,
      instructions: String,
      courierService: String, // Optional: Name of the courier service used
      trackingNumber: String, // Optional: Courier tracking number
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
