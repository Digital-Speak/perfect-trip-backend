const Dossier = require("../models/Dossier");
const knex = require('../../db');
const client = require('./client');

exports.addDossier = async (req, res, next) => {
  try {
    const newClient = client.addClient(req, res);
    if (newClient) {
      newClient.then(async (client) => {
        const newDossier = new Dossier({
          starts_at: req.body.starts_at,
          ends_at: req.body.ends_at,
          circuit_id: req.body.circuit_id,
          agency_id: req.body.agency_id,
          client_id: client[0].id,
          created_at: new Date(),
          updated_at: new Date()
        })
        await knex('dossier').insert(newDossier).then(() => {
          return res.status(200).json({
            success: true,
            message: "Dossier added successfully",
          });
        });
      })
    }
    else {
      return res.status(500).json({
        success: false,
        message: "An error occured while addind the client"
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};