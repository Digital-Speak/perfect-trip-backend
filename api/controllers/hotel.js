const Hotel = require("../models/Hotel");
const knex = require('../../db');

exports.addHotel = async (req, res, next) => {
  try {
    const newHotel = new Hotel({ name: req.body.name, stars: req.body.stars, city_id: req.body.city_id, created_at: new Date(), updated_at: new Date() });
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

exports.getCircuitCityHotels = async (req, res, next) => {
  try {
    const hotels = knex
      .distinct(
        'circuit.name as circuit',
        'hotel.name as hotelName',
        'hotel.id as hotelId',
        'city.name as cityName',
        'circuit_city.number_of_nights as numberOfNights',
        'city.id as cityId',
        'circuit_city.id as circuit_city_id',
        'hotel.stars as cat'
      )
      .from('hotel')
      .leftJoin('city', 'city.id', '=', 'hotel.city_id')
      .leftJoin(
        'circuit_city',
        'circuit_city.city_id',
        '=',
        'city.id'
      )
      .leftJoin(
        'circuit',
        'circuit.id',
        '=',
        'circuit_city.circuit_id'
      )
      .where('circuit.id', '=', req.body.id);

    if (req.body.cat !== "X") {
      return res.status(200).json({
        success: true,
        hotels: await hotels.andWhere('hotel.stars', 'like', `%${req.body.cat}%`).groupBy(
          'circuit.name',
          'city.name',
          'hotel.name',
          'circuit_city.number_of_nights',
          'city.id',
          'hotel.id',
          'circuit_city.id',
          'hotel.stars'
        ).orderBy('city.id')
      });
    } else {
      return res.status(200).json({
        success: true,
        hotels: await hotels.groupBy(
          'circuit.name',
          'city.name',
          'hotel.name',
          'circuit_city.number_of_nights',
          'city.id',
          'hotel.id',
          'circuit_city.id',
          'hotel.stars'
        ).orderBy('city.id')
      });
    }




  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getHotels = async (req, res, next) => {
  try {
    await knex
      .select(
        'hotel.*',
        'city.name as cityName'
      )
      .from('hotel')
      .leftJoin('city', 'city.id', '=', 'hotel.city_id')
      .then(async (hotels) => {
        if (hotels.length === 0) {
          return res.status(400).json({
            success: false,
            message: "there is no hotels"
          });
        } else {
          return res.status(200).json({
            success: true,
            hotels
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