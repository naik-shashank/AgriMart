const jwt=require('jsonwebtoken')
const User=require("../models/UserModel")
const apperror=require('../utils/apierror')
const {promisify}=require('util')
const catchErr = require("../utils/catchasync");
const sendEmail=require('../utils/email')
const crypto=require('crypto')

const signToken=(id)=>{
  return jwt.sign({id},process.env.secrete,{
    expiresIn:process.env.expire
  })
}

const createJwtAndSend=(user,statusCode,res)=>{
  let token=signToken(user._id)
  
  res.status(statusCode).json({
    status: "success",
    token,
    user
  });
}

exports.sinup=catchErr(async (req, res, next) => {
  console.log(req.body)
  let data = await User.create(req.body);
  
  createJwtAndSend(data,201,res)
  
});

exports.login=catchErr(async(req,res,next)=>{
  
  const {email,password}=req.body

  if(!email || !password) return next(new apperror("please enter email and password",400))
  
  
  else{
    let match=await User.findOne({email}).select('+password') 
    

    if(!match || !(await match.passcheck(password,match.password)))
        return next(new apperror("invalid email or password",401))
    
    createJwtAndSend(match,200,res)
   
  
  }
})





exports.authorize=(...roles)=>{
  return (req,res,next)=>{
   
    if(!roles.includes(req.user.role))
      return next(new apperror("you cannot perform this action, not authorized",403))
    
    next()
  }
  
}

exports.protect=catchErr(async (req,res,next)=>{
  let token='';

  //check if token exist
  if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) 
      return next(new apperror("not authorised, please login",401))
  token=req.headers.authorization.split(' ')[1]
  

  //token validation
  const verifyasync=promisify(jwt.verify)
  const decoded=await verifyasync(token,process.env.secrete)


  //check if user still exist
  
  const currentUser=await User.findOne({_id:decoded.id})
  if(!currentUser) 
    return next(new apperror("user of this token is deleted",401))


 

  //assinginig this user to req Object
  req.user=currentUser
  
  next()
})

exports.forgotPassword=catchErr( async (req,res,next)=>{
    //get user via email
    const currentUser=await User.findOne({email:req.body.email})
    if(!currentUser)
      return next(new apperror("no user found with that email",404))


    //generate reset token (schma method)
    const resetToken=currentUser.createPassResetToken()
    await currentUser.save({validateBeforeSave:false}) //gives error duce to confirm password


    //send that token to  users email

    const url=`${req.protocol}://${req.get('host')}/api/user/${resetToken}`;
    const message=`Forgot password? submit a patch req with your new password and passwordConfirm to: ${url}.\nIf you didn't forget your password, please ignore this email`
    try{
    await sendEmail({
      email:req.body.email,
      subject:"your password reset token (valid for 10 min)",
      message
    })

    res.status(200).json({
      status:"success, email sent",
      message:"token sent to email"
    })

  }
  catch{
    currentUser. passChangeToken=undefined
    currentUser.  passChangeTime=undefined
    await currentUser.save({validateBeforeSave:false})

    return next(new apperror("there was an error sending emain, Try again later!"))
  }
})

exports.resetPassword=catchErr( async (req,res,next)=>{

  //get user based on token
  const hashedToken=crypto.createHash('sha256').update(req.params.x).digest('hex')
  const user=await User.findOne({ passChangeToken:hashedToken, passChangeTimer:{$gte:Date.now()}})

  //check is no user found
  if(!user) return(next(new apperror('invalid Token or Timer expired',404)))
  
  user.password=req.body.password
  user.checkpassword=req.body.checkpassword
  user.passChangeToken=undefined
  user.passChangeTimer=undefined
  await user.save()                               
  
  //update passChandedAt (using schema middleware)

  //loging user in by sendion jwt
  createJwtAndSend(user,200,res)
  
})

exports.updatePassword=catchErr(async (req,res,next)=>{      //pass cahnge for loged-in users
  
  //get user from collection
  const user=await User.findOne({_id:req.user._id}).select('+password')
 
  //cehecking if the entered password is correct
  if(!await user.passcheck(req.body.password,user.password)) return next(new apperror('password is incorrect',401))
  

  //updating password
   user.password=req.body.newPassword
   user.checkpassword=req.body.checkpassword
   await user.save()

  
  //loging in by sending jwt
  createJwtAndSend(user,200,res)

})