const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    req.userData = decoded;
    return res.status(200).json({
      success: true,
      message: "JWT valid",
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "You must be authenticated to perform this action",
      error,
    });
  }
};