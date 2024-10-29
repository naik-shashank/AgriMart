const express=require('express')
const router=express.Router();

const multer=require('multer')
const { CloudinaryStorage }=require('multer-storage-cloudinary');
const cloudinary=require("../utils/cloudinary");
const user=require('../Controllers/userController')
const auth=require('../Controllers/authcontroller')

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'Products', // Folder where images will be stored in Cloudinary
         
      public_id: (req, file) => `${Date.now()}`, // Public ID (filename)
      transformation: [
        { width: 800, height: 600, crop: "limit" }, // Resize
        { quality: "auto:good" } // Automatically adjust quality
      ],
    },
    
  });
  
  
  const upload = multer({ storage });
  

router.route('/signup').post(upload.single("img"),auth.sinup)
router.route('/login').post(upload.single("img"),auth.login)
router.route('/product').post(auth.protect,upload.single("img"),user.createProduct)

router.route('/nearbyshops/:dist?').get(auth.protect,user.nearbyshops)


module.exports=router