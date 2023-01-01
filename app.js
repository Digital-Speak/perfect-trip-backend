const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

require('dotenv').config();

//route
const userRoutes = require("./api/routes/user");
const clientRoutes = require("./api/routes/client");
const cityRoutes = require("./api/routes/city");
const hotelRoutes = require("./api/routes/hotel");
const agencyRoutes = require("./api/routes/agency");
const dossierRoutes = require("./api/routes/dossier");
const circuitRoutes = require("./api/routes/circuit");
const globalRoutes = require("./api/routes/global");


// morgan to log in our dev environment
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

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
app.use("/", globalRoutes);
app.use("/user", userRoutes);
app.use("/client", clientRoutes);
app.use("/city", cityRoutes);
app.use("/hotel", hotelRoutes);
app.use("/agency", agencyRoutes);
app.use("/circuit", circuitRoutes);
app.use("/dossier", dossierRoutes);

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