const User=require('../models/UserModel.js')
const Shop=require('../models/OutletModel')
const catchAsync = require("../utils/catchasync");
const apierror = require("../utils/apierror");
const jwt=require('jsonwebtoken')
const removeImg =require('../utils/imageRemove.js')
const mongoose=require('mongoose')
const Product=require('../models/ProductModel.js')

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Check if an image file is provided
    if (!req.file) {
      return res.status(400).json({ status: "fail", message: "No image file provided" });
    }

    // Basic Validation (Add more as needed)
    if (!productData.name || !productData.category || !productData.price) {
      await removeImg(req.file.path);
      return res
        .status(400)
        .json({ error: "Name, category, and price are required" });
    }

    // Add image path to product data
    productData.img = req.file.path;
    productData.outletId= new mongoose.Types.ObjectId(req.user.outletId)
    // Create a new product in the database
    const newProduct = await Product.create(productData);
    res.status(201).json({ status: "success", newProduct });

  } catch (err) {
    // Remove the uploaded image if there's an error
    await removeImg(req.file.path);
    
    if (err.code === 11000) {
      // MongoDB duplicate key error
      return res.status(400).json({
        error: "Product with this name already exists",
      });
    }
    
    res.status(500).json({ error: "Failed to create product", details: err.message });
  }
};



  exports.nearbyshops = catchAsync(async (req, res, next) => {
 
  
    const userCoordinates = [req.user.address.coordinates.lat, req.user.address.coordinates.lon];
  
    const shops = await Shop.find({
      "address.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: userCoordinates,
          },
          $maxDistance: req.params.dist || 5000, // Set max distance to z meters
        },
      },
    });
    res.status(200).json({
      status: "success",
      size:shops.length,
      shops,
    });
  });