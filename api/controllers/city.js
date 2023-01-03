const City = require("../models/City");
const knex = require('../../db');

exports.addCity = async (req, res, next) => {
  try {
    await knex('city')
      .where('name', req.body.name)
      .select("*").then(async (city) => {
        if (city.length !== 0) {
          console.log('City already exist');
          return res.status(500).json({
            success: false,
            message: "City already exist",
          });
        } else {
          const newCity = new City({ name: req.body.name, created_at: new Date(), updated_at: new Date() });
          await knex('city').insert(newCity).then(() => {
            return res.status(200).json({
              success: true,
              message: "City added successfully",
            });
          });
        }
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

exports.deleteCity = async (req, res, next) => {
  try {
    await knex('city')
      .where('id', req.body.id)
      .select("*").then(async (city) => {
        if (city.length === 0) {
          return res.status(400).json({
            success: false,
            message: "City does not exist"
          });
        } else {
          await knex('city')
            .where({ id: req.body.id })
            .del().then(() => {
              return res.status(200).json({
                success: true,
                message: "City deleted successfully"
              });
            });
        }
      })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.editCity = async (req, res, next) => {
  try {
    await knex('city')
      .where('id', req.body.id)
      .select("*").then(async (city) => {
        if (city.length === 0) {
          return res.status(400).json({
            success: false,
            message: "City does not exist"
          });
        } else {
          const updatedCity = new City({ name: req.body.name, updated_at: new Date() });
          knex('city')
            .where({ id: req.body.id })
            .update(updatedCity).then(() => {
              return res.status(200).json({
                success: true,
                message: "City updated successfully"
              });
            });
        }
      })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getCities = async (req, res, next) => {
  try {
    await knex('city')
      .select("*").then(async (cities) => {
        if (cities.length === 0) {
          return res.status(400).json({
            success: false,
            message: "there is no cities"
          });
        } else {
          return res.status(200).json({
            success: true,
            cities
          });
        }
      })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};