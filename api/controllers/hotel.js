const Hotel = require("../models/Hotel");
const knex = require('../../db');

exports.addHotel = async (req, res, next) => {
  try {
    const newHotel = new Hotel({ name: req.body.name, stars: req.body.city_id, city_id: req.body.city_id, created_at: new Date(), updated_at: new Date() });
    await knex('hotel').insert(newHotel).then(() => {
      return res.status(200).json({
        success: true,
        message: "Hotel added successfully",
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

exports.deleteHotel = async (req, res, next) => {
  try {
    await knex('hotel')
      .where('id', req.body.id)
      .select("*").then(async (hotel) => {
        if (hotel.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Hotel does not exist"
          });
        } else {
          await knex('hotel')
            .where({ id: req.body.id })
            .del().then(() => {
              return res.status(200).json({
                success: true,
                message: "Hotel deleted successfully"
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

exports.editHotel = async (req, res, next) => {
  try {
    await knex('hotel')
      .where('id', req.body.id)
      .select("*").then(async (hotel) => {
        if (hotel.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Hotel does not exist"
          });
        } else {
          const updatedHotel = new Hotel({ name: req.body.name, city_id: req.body.city_id, stars: req.body.stars, updated_at: new Date() });
          knex('hotel')
            .where({ id: req.body.id })
            .update(updatedHotel).then(() => {
              return res.status(200).json({
                success: true,
                message: "Hotel updated successfully"
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
