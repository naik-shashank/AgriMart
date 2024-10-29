const express=require('express')
const router=express.Router();
const multer=require('multer')
const mult = multer();

const auth=require('../Controllers/authcontroller')
const outlet=require('../Controllers/outletController')

router.route('/create').post(mult.any(),outlet.create) //auth.protect,
router.route('/near/:x?/:y?/:z?').get(outlet.near)


module.exports=router