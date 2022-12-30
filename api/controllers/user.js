const User = require("../models/User");
const knex = require('../../db');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require('../../tools/mails/reservationMail');
var sender = require("../../tools/mails/testMail");

exports.login = async (req, res, next) => {
  try {
    await knex('user')
      .where('email', req.body.email)
      .select("*").then((user) => {
        if (user.length === 0) {
          console.log('email does not exist')
          res.status(500).json({
            message: "Authentication error",
          });
        } else {
          bcrypt.compare(
            req.body.password,
            user[0].password,
            function (err, result) {
              if (err) {
                return res.status(401).json({
                  success: false,
                  message: "Auth infos incorrect",
                });
              }
              if (result) {
                const token = jwt.sign(
                  {
                    email: user[0].email,
                    userId: user[0].id,
                    isAdmin: user[0].is_admin,
                  },
                  process.env.JWT_SECRET,
                  {
                    expiresIn: "1h",
                  }
                );
                return res.status(200).json({
                  success: true,
                  message: "Auth successful",
                  email: req.body.email,
                  token
                });
              }
              return res.status(401).json({
                success: false,
                message: "Auth failed",
              });
            }
          );
        }
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

exports.signUp = async (req, res, next) => {
  try {
    await knex('user')
      .where('email', req.body.email)
      .select("*").then((user) => {
        if (user.length === 0) {
          bcrypt.hash(req.body.password, 10, async (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err,
              });
            } else {
              const user = new User({ name: req.body.name, email: req.body.email, password: hash, is_admin: req.body.is_admin, created_at: new Date(), updated_at: new Date() });
              await knex('user').insert(user).then((res) => {
                console.log(res)
              });
              return res.status(200).json({
                success: true,
                message: "User added successfully",
                user,
              });
            }
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Email address already exist",
            email: req.body.email
          });
        }
      })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error,
    });
  }
};

exports.delete_user = async (req, res, next) => {
  try {
    const userData = req.userData;
    if (userData.isAdmin) {
      await knex('user')
        .where('email', req.body.email)
        .select("*").then(async (user) => {
          if (user.length === 0) {
            return res.status(400).json({
              success: false,
              message: "Email address does not exist"
            });
          } else {
            await knex('user')
              .where({ email: req.body.email })
              .del().then(() => {
                return res.status(200).json({
                  success: true,
                  message: "User deleted successfully"
                });
              });
          }
        })
    } else {
      return res.status(400).json({
        success: false,
        message: "You do not have admin priviliges to perform this action"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const userData = req.userData;
    if (userData.isAdmin){
      await knex('user')
      .select("*")
      .where('is_admin','=',false)
      .then(async (users) => {
        if (users.length === 0) {
          return res.status(400).json({
            success: false,
            message: "there is no user"
          });
        } else {
          return res.status(200).json({
            success: true,
            users
          });
        }
      })
    }else {
      return res.status(400).json({
        success: false,
        message: "You do not have admin priviliges to perform this action"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};
