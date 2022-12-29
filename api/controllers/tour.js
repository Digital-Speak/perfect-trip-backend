const Circuit = require("../models/Circuit");
const knex = require('../../db');

exports.addCircuit = async (req, res, next) => {
  try {
    const newCircuit = new Circuit({ name: req.body.name, city_id: req.body.city_id, created_at: new Date(), updated_at: new Date() });
    await knex('circuit').insert(newCircuit).then(() => {
      return res.status(200).json({
        success: true,
        message: "Circuit added successfully",
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

