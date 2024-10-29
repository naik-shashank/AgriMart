const User=require('../models/UserModel.js')
const Shop=require('../models/OutletModel')
const catchAsync = require("../utils/catchasync");
const apierror = require("../utils/apierror");
const jwt=require('jsonwebtoken')
const removeImg =require('../utils/imageRemove.js')
const mongoose=require('mongoose')
const Product=require('../models/ProductModel.js')
const Order=require("../models/OrderModel.js");


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




exports.createOrder = async (req, res) => {
  try {
    const customerId=req.user._id;
    let { storeId, outletId, Orders, totalPrice } = req.body;

    // Parse the Orders from stringified JSON
    Orders=JSON.parse(Orders)

    console.log(req.body)
    console.log(customerId)
    // Create a new order
    const newOrder = new Order({
      customerId,
      outletId:new mongoose.Types.ObjectId(outletId),
      Orders,
      totalPrice,
    });

    // Save the order to the database
    await newOrder.save();

    // Respond with the created order
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    // Destructure query parameters for filtering and pagination
    const { category, outletId, page = 1, limit = 10 } = req.query;

    // Build the query object
    let query = {};
    
    // Add category filter if provided
    if (category) {
      query.category = category;
    }
    
    // Add outletId filter if provided
    if (outletId) {
      query.outletId = mongoose.Types.ObjectId(outletId);
    }

    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Fetch products with pagination
    const products = await Product.find(query)
      .skip((pageNumber-1)*limitNumber) // Skip previous pages
      .limit(limitNumber); // Limit results per page

    // Count total products for pagination info
    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      status: "success",
      results: products.length,
      total: totalProducts,
      page: pageNumber,
      products
    });
  } catch (err) {
    console.error("Error retrieving products:", err);
    res.status(500).json({ error: "Failed to retrieve products", details: err.message });
  }
};




exports.getAllOrders = async (req, res) => {
  try {
    // Destructure query parameters for filtering and pagination
    const { status, customerId, page = 1, limit = 10 } = req.query;

    // Build the query object
    let query = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add customerId filter if provided
    if (customerId) {
      query.customerId = mongoose.Types.ObjectId(customerId);
    }

    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Fetch orders with pagination
    const orders = await Order.find(query)
      .skip((pageNumber - 1) * limitNumber) // Skip previous pages
      .limit(limitNumber); // Limit results per page

    // Count total orders for pagination info
    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      status: "success",
      results: orders.length,
      total: totalOrders,
      page: pageNumber,
      orders
    });
  } catch (err) {
    console.error("Error retrieving orders:", err);
    res.status(500).json({ error: "Failed to retrieve orders", details: err.message });
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