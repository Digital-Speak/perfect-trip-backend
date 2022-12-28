const User = require("../models/User");
const knex = require('../../db');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res, next) => {
  try {
    await knex('user')
      .where('email', req.body.email)
      .select("*").then((user) => {
        console.log(user)

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
    res.status(500).json({
      error,
    });
  }
};

exports.signUp = async (req, res, next) => {
  try {
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      } else {
        const user = new User({ name: req.body.name, email: req.body.email, password: hash });
        await knex('user').insert({
          email: user.email,
          name: user.name,
          password: user.password,
        }).then((res) => {
          console.log(res)
        });
        return res.status(200).json({
          success: true,
          message: "User added successfully",
          user,
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.delete_user = (req, res, next) => {
  try {
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      await knex('user')
        .where({ email: req.body.email })
        .del().then((res) => {
          console.log(res)
        });
      return res.status(200).json({
        success: true,
        message: "User deleted successfully"
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};