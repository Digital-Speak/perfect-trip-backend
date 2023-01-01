
const jwt = require("jsonwebtoken");

const createAccessToken = (user) => {
  return jwt.sign(
    {
      email: user[0].email,
      userId: user[0].id,
      isAdmin: user[0].is_admin,
    },
    process.env.JWT_ACCESS_TOKEN,
    {
      expiresIn: "15m",
    }
  )
}

const createRefreshToken = (user) => {
  console.log(user)
  return jwt.sign(
    {
      userId: user[0].id,
      jwtVersionCode: user[0].jwt_version_code

    },
    process.env.JWT_REFRESH_TOKEN,
    {
      expiresIn: "7d",
    }
  )
}

module.exports = {
  createAccessToken,
  createRefreshToken
}