const express = require("express");
const dotenv = require("dotenv");

const apierror = require("./utils/apierror");
const { errcall } = require("./Controllers/errcontroller");

dotenv.config({ path: "conf.env" });

const outletRouter=require('./routes/adminRoute')
const userRouter=require('./routes/userRoute')

const app = express();
app.use(express.json());
app.use("/outlet",outletRouter)
app.use("/user",userRouter)

// app.use("/api/tour", router);
app.all("*", errcall);




///////////////////////////////////////////////////////////// error handling

const dev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stackTrace: err.stack,
  });
};

const pro = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "ERROR",
      message: "something eally went wrong...",
    });
    console.error(err);
  }
};




app.use((err, req, res, next) => {
  //error handling middleware
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV == "development") dev(err, res);
  else if (process.env.NODE_ENV == "production") pro(err, res);
  
});

module.exports = app;
