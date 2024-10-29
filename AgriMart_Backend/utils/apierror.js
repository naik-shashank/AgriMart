class AppError extends Error
{
  constructor(message,Code)
  {
    super(message);
    this.statusCode=Code
    this.status=`${Code}`.startsWith('4')?  "fail": "error";
    this.isOperational=true
    Error.captureStackTrace(this,this.constructor);
  }
}

module.exports=AppError