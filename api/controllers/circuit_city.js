const knex = require('../../db');

exports.addCircuitCity = async (req, res, next) => {
 try {
  await knex('circuit_city')
   .insert({
    circuit_id: req.body.circuit_id,
    city_id: req.body.city_id,
    number_of_nights: req.body.number_of_nights,
   })
   .returning("*")
   .then(async (response) => {
    console.log(response)
   });
 } catch (error) {
  console.log(error);
  return res.status(500).json({
   error,
  });
 }
};