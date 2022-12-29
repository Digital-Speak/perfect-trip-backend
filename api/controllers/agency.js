const Agency = require("../models/Agency");
const knex = require('../../db');

exports.addAgency = async (req, res, next) => {
  try {
    await knex('agency')
      .where('name', req.body.name)
      .select("*").then(async (agency) => {
        if (agency.length !== 0) {
          console.log('Agency already exist');
          return res.status(500).json({
            success: false,
            message: "Agency already exist",
          });
        } else {
          const newAgency = new Agency({ name: req.body.name, created_at: new Date(), updated_at: new Date() });
          await knex('agency').insert(newAgency).then(() => {
            return res.status(200).json({
              success: true,
              message: "Agency added successfully",
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

exports.deleteAgency = async (req, res, next) => {
  try {
    await knex('agency')
      .where('id', req.body.id)
      .select("*").then(async (agency) => {
        if (agency.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Agency does not exist"
          });
        } else {
          await knex('agency')
            .where({ id: req.body.id })
            .del().then(() => {
              return res.status(200).json({
                success: true,
                message: "Agency deleted successfully"
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

exports.editAgency = async (req, res, next) => {
  try {
    await knex('agency')
      .where('id', req.body.id)
      .select("*").then(async (agency) => {
        if (agency.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Agency does not exist"
          });
        } else {
          const updatedAgency = new Agency({ name: req.body.name, updated_at: new Date() });
          knex('agency')
            .where({ id: req.body.id })
            .update(updatedAgency).then(() => {
              return res.status(200).json({
                success: true,
                message: "Agency updated successfully"
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
