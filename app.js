const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
require('dotenv').config();

//route
const userRoutes = require("./api/routes/user");
const cityRoutes = require("./api/routes/city");
const hotelRoutes = require("./api/routes/hotel");


// morgan to log in our dev environment
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if(req.method === "OPTIONS"){
    res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
})

//Routes which should handle requests
app.use("/user", userRoutes);
app.use("/city", cityRoutes);
app.use("/hotel", hotelRoutes);

// Error handling
app.use((req, res, next)=>{
   const error = new Error('Not found');
   error.status = 404;
   next(error);
})

app.use((error, req, res, next)=>{
     res.status(error.status || 500);
     res.json({
       error:{
         message: error.message
       }
     })
})
module.exports = app;