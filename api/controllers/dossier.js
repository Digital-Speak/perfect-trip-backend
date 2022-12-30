const Dossier = require("../models/Dossier");
const knex = require('../../db');
const client = require('./client');

exports.addDossier = async (req, res, next) => {
  try {
    const newClient = client.addClient(req, res);
    if (newClient) {
      newClient.then(async (client) => {
        const newDossier = new Dossier({
          dossier_num: req.body.dossier_num,
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

exports.deleteDossier = async (req, res, next) => {
  try {
    await knex('dossier')
      .where('dossier_num', req.body.dossier_num)
      .select("*").then(async (dossier) => {
        if (dossier.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Dossier does not exist"
          });
        } else {
          await knex('dossier')
            .where({ dossier_num: req.body.dossier_num })
            .del().then(() => {
              return res.status(200).json({
                success: true,
                message: "Dossier deleted successfully"
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

exports.getLastDossier = async (req, res, next) => {
  try {
    await knex('dossier')
      .select("dossier_num")
      .orderBy('dossier_num', 'desc')
      .limit(1)
      .then(async (dossier) => {
        if (dossier.length === 0) {
          return res.status(400).json({
            success: false,
            message: "there is no dossier"
          });
        } else {
          return res.status(200).json({
            success: true,
            dossier_num: parseInt(dossier[0].dossier_num)+1
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