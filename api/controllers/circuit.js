const Circuit = require("../models/Circuit");
const knex = require('../../db');

exports.addCircuit = async (req, res, next) => {
  try {
    await knex('circuit')
      .where('name', req.body.name)
      .andWhere({
        is_special: false
      })
      .select("*")
      .then(async (circuit) => {
        console.log(circuit);
        if (circuit.length !== 0) {
          return res.status(500).json({
            success: false,
            message: "Circuit already exist",
          });
        } else {
          const newCircuit = new Circuit({ name: req.body.name, created_at: new Date(), updated_at: new Date() });
          await knex('circuit').insert(newCircuit).returning("*").then((data) => {
            return res.status(200).json({
              success: true,
              circuit: data,
              message: "Circuit added successfully",
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

exports.deleteCircuit = async (req, res, next) => {
  try {
    await knex('circuit')
      .where('id', req.body.id)
      .select("*").then(async (circuit) => {
        if (circuit.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Circuit does not exist"
          });
        } else {
          await knex('circuit')
            .where({ id: req.body.id })
            .del().then(() => {
              return res.status(200).json({
                success: true,
                message: "Circuit deleted successfully"
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

exports.editCircuit = async (req, res, next) => {
  try {
    await knex('circuit')
      .where('id', req.body.id)
      .select("*").then(async (circuit) => {
        if (circuit.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Circuit does not exist"
          });
        } else {
          const updatedCircuit = new Circuit({ name: req.body.name, updated_at: new Date() });
          knex('circuit')
            .where({ id: req.body.id })
            .update(updatedCircuit).then(() => {
              return res.status(200).json({
                success: true,
                message: "Circuit updated successfully"
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

exports.getCircuits = async (req, res, next) => {
  try {
    await knex('circuit')
      .select("*")
      .where("is_special", "=", false)
      .then(async (circuits) => {
        if (circuits.length === 0) {
          return res.status(400).json({
            success: false,
            message: "there is no circuit"
          });
        } else {
          return res.status(200).json({
            success: true,
            circuits
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