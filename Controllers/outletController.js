const mongoose=require('mongoose')
const Outlet=require('../models/OutletModel')
const User=require('../models/UserModel')
const catchAsync = require("../utils/catchasync");
const apierror = require("../utils/apierror");

exports.create = catchAsync(async (req, res, next) => {
   
  if (!req.body.storeOwnerEmail) {
    return next(new apierror("Enter email of store owner (storeOwnerEmail)", 400));
}

const storeOwner = await User.findOne({
    email: req.body.storeOwnerEmail,
    role: 'storeOwener' // Check if the role is 'storeOwner'
});

if (!storeOwner) {
    return next(new apierror("Store owner not found", 404));
}


  req.body.storeOwner= new mongoose.Types.ObjectId(storeOwner._id)
  const data = await Outlet.create(req.body);
  storeOwner.outletId=data._id;
  
  await storeOwner.save({ validateBeforeSave: false });


  res.status(200).json({
    status: "success",
    data:data,
  });
});

exports.near = catchAsync(async (req, res, next) => {
  // User's coordinates (e.g., from Geolocation API)

  if(!req.params.x || !req.params.y){
    return next(new apierror('coodinates not specified',400))
  }

  const userCoordinates = [req.params.x, req.params.y];

  const shops = await Shop.find({
    "address.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: userCoordinates,
        },
        $maxDistance: req.params.z || 5000, // Set max distance to z meters
      },
    },
  });
  res.status(200).json({
    status: "success",
    size:shops.length,
    shops,
  });
});
