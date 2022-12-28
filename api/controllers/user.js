const User = require("../models/User");
const knex = require('../../db');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res, next) => {
  try {
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      } else {
        const user = new User({name:"nb",email:"nb@gmail.com",password: hash});
        await knex('user').insert({
          email: user.email,
          name: user.name,
          password: user.password,
        }).then((res)=>{
           console.log(res)
        });
        return res.status(200).json({
          success: true,
          message: "Auth successful",
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
  const id = req.params.userId;
  try {
    return res.status(200).json({
      success: true,
      message: "Deleted successful",
      id
    });
  } catch (error) {
    console.log(id);
    res.status(500).json({
      error,
    });
  }
};