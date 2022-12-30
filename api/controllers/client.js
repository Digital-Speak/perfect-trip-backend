const Client = require("../models/Client");
const knex = require('../../db');

exports.addClient = async (req, res, next) => {
  try {
    const newClient = new Client({ref_client:req.body.ref_client, name: req.body.name, category:req.body.category, created_at: new Date(), updated_at: new Date() });
    const client =await knex('client').insert(newClient).returning('*');
    return client;
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

exports.getClients = async (req, res, next) => {
  try {
    await knex('client')
      .select("*").then(async (clients) => {
        if (clients.length === 0) {
          return res.status(400).json({
            success: false,
            message: "there is no clients"
          });
        } else {
          return res.status(200).json({
            success: true,
            clients
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