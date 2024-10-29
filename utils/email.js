const nodemailer=require('nodemailer')
const { options } = require('../app')

const sendEmail=async (options)=>{
    const transporter=nodemailer.createTransport({
      host:process.env.EMAIL_HOST,
      port:process.env.EMAIL_PORT,
      auth:{
        user:process.env.EMAIL_USERNAME,
        pass:process.env.EMAIL_PASS
      }
    })

    const mailOptions={
        from:"shashank <shank@gmail.com>",
        to:options.email,
        subject:options.subject,
        text:options.message
    }
  console.log("sending email...")
    await transporter.sendMail(mailOptions)
    console.log("email sent!!")
}
module.exports=sendEmail