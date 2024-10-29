const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["fertilizer", "tools"] },
  category: {
    type: String,
    enum: ["Organic", "Inorganic", "Biofertilizers", "tools"],
    required: [true, "mention catagory"],
  },
  composition: String,
  description: String,
  recommendedUsage: String,
  price: { type: String, required: true },
  img: String,
  
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
    }, // Linked Outlet
    stock: { type: Number, required: true }, // Available stock at this outlet
  
});

module.exports = mongoose.model("Product", ProductSchema);
