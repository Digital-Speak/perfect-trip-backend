const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    console.log("decoded",decoded)
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "You must be authenticated to perform this action",
      error,
    });
  }
};
