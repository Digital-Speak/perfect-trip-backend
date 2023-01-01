const { createRefreshToken } = require("./createJWTtoken")

const createJWTRefreshTokencookie = (res, user) => {
  res.cookie('jid', createRefreshToken(user),
    {
      httpOnly: true
    })
}

module.exports = {
  createJWTRefreshTokencookie,
}