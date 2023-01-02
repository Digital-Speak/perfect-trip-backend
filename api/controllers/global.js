const User = require("../models/User");
const Crypto = require('crypto')
const knex = require('../../db');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require('../../tools/mails/reservationMail');
const forgotPasswordEmail = require('../../tools/mails/forgotPasswordMail');
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
          .select("*").then(async (user) => {
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


