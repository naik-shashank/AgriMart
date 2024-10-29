const apierror = require("../utils/apierror");

exports.errcall = (req, res, next) => {
    let err = new apierror("link not found", 404);
    next(err);
  };