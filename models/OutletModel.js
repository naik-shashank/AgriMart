const mongoose=require('mongoose')

const outletSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { 
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    storeOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactInfo: {
      phone: String,
      address: {
        area: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: 'India' }
      }
    },
    


    paymentInfo: {
      upiId: String, // UPI ID for payments
      bankAccount: {
          accountNumber: String,
          accountHolderName: String,
          ifscCode: String
      }
  },
  });
  
  outletSchema.index({ location: "2dsphere" });
  
  module.exports = mongoose.model('Outlet', outletSchema);
  