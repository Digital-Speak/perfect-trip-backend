const User = require("../models/User");
const Crypto = require('crypto')
const knex = require('../../db');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createAccessToken } = require("../../tools/helpers/createJWTtoken");
const { createJWTRefreshTokencookie } = require("../../tools/helpers/createCookie");
require("dotenv").config();

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.jid;
    if (!token) {
      return res.status(401).json({
        success: false,
        accessToken: ""
      });
    } else {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
      if (payload) {
        await knex('user')
          .where('id', payload.userId)
          .select("*").returning('*').then(async (user) => {
            if (user.length === 0) {
              console.log('user does not exist')
              return res.status(401).json({
                success: false,
                accessToken: ""
              });
            } else {
              if(user[0].jwt_version_code !== payload.jwtVersionCode){
                return res.status(401).json({
                  success: false,
                  message: 'invalid refresh token version',
                  accessToken: ""
                });
              }else{
                createJWTRefreshTokencookie(res,user);
                return res.status(200).json({
                  success: true,
                  data: {
                    name: user[0]?.name,
                    email: user[0]?.email,
                    is_admin: user[0]?.is_admin,
                    created_at: user[0]?.created_at,
                  },
                  accessToken: createAccessToken(user)
                });
              }     
            }
          })
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
      success: false,
      accessToken: ""
    });
  }
};


