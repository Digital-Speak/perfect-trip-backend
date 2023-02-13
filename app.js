const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const userRoutes = require("./api/routes/user");
const clientRoutes = require("./api/routes/client");
const cityRoutes = require("./api/routes/city");
const hotelRoutes = require("./api/routes/hotel");
const agencyRoutes = require("./api/routes/agency");
const dossierRoutes = require("./api/routes/dossier");
const flightRoutes = require("./api/routes/flight");
const circuitRoutes = require("./api/routes/circuit");
const circuitCityRoutes = require("./api/routes/circuit_city");
const globalRoutes = require("./api/routes/global");
const importDataRoutes = require("./api/routes/import");

app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); })
app.use(cors({ credentials: true, origin: `${process.env.CLIENT_URL}` }));
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.set('etag', false);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === "OPTIONS") {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

app.use("/", globalRoutes);
app.use("/user", userRoutes);
app.use("/client", clientRoutes);
app.use("/city", cityRoutes);
app.use("/hotel", hotelRoutes);
app.use("/agency", agencyRoutes);
app.use("/circuit", circuitRoutes);
app.use("/dossier", dossierRoutes);
app.use("/flight", flightRoutes);
app.use("/circuit_city", circuitCityRoutes);
app.use("/import", importDataRoutes);

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
})

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  })
});

module.exports = app;
