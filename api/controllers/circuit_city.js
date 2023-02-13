const knex = require('../../db');

exports.addCircuitCity = async (req, res, next) => {
  try {
    console.log({
      circuit_id: req.body.circuit_id,
      city_id: req.body.city_id,
      number_of_nights: req.body.number_of_nights,
    });
    await knex('circuit_city')
      .insert({
        circuit_id: req.body.circuit_id,
        city_id: req.body.city_id,
        number_of_nights: req.body.number_of_nights,
      })
      .returning("*")
      .then(async (response) => {
        res.status(200).send({
          success: true
        })
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

exports.getCircuitCity = async (req, res, next) => {
  try {
    await knex('circuit_city')
      .select(
        "circuit.id as circuit_id",
        "circuit.name as circuit",
        "city.id as city_id",
        "city.name as city",
        "circuit_city.number_of_nights as number_of_nights",
        "circuit_city.deleted as deleted",
        "hotel.name as hotel_id",
        "hotel.name as hotel",
        "hotel.stars as cat",
      )
      .leftJoin('city', 'city.id', '=', 'circuit_city.city_id')
      .leftJoin('circuit', 'circuit.id', '=', 'circuit_city.circuit_id')
      .leftJoin('hotel', 'hotel.city_id', '=', 'city.id')
      .where("circuit.is_special", "=", false)
      .returning("*")
      .then(async (response) => {
        res.status(200).send({
          success: true,
          circuits_cities: response
        })
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};