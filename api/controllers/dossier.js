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
          starts_at: new Date(new Date(req.body.starts_at).setHours(0, 0, 0, 0)),
          ends_at: new Date(new Date(req.body.starts_at).setHours(0, 0, 0, 0)),
          circuit_id: req.body.circuit_id,
          agency_id: req.body.agency_id,
          client_id: client[0].id,
          note: req.body.note,
          created_at: new Date(),
          updated_at: new Date()
        })
        await knex('dossier').insert(newDossier)
          .returning('dossier_num')
          .then(async (dossier_num) => {
            req.body.hotels_dossier.forEach(async (hotelForFolder) => {
              await knex('dossier_hotel')
                .insert({
                  dossier_id: hotelForFolder.dossier_num,
                  extra_nights: hotelForFolder.extra_nights,
                  hotel_id: hotelForFolder.hotel_id,
                }).then(async () => {

                });
            });
            req.body.typeOfHb.forEach(async (item) => {
              await knex('nbrpaxforhbtype')
                .insert({
                  typepax: item.label,
                  nbr: item.nbr,
                  dossier_id: dossier_num[0].dossier_num,
                })
            });
          });
        return res.status(200).json({
          success: true,
          message: "Dossier added successfully",
        });
      })
    } else {
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
          return res.status(200).json({
            success: true,
            dossier_num: 0
          });
        } else {
          return res.status(200).json({
            success: true,
            dossier_num: parseInt(dossier[0].dossier_num) + 1
          });
        }
      })
  } catch (error) {
    res.status(500).json({
      error,
      success: false
    });
  }
};

exports.getDossiers = async (req, res, next) => {
  try {
    const start_at = new Date(req.body.starts_at).setHours(0, 0, 0, 0);
    const end_at = new Date(req.body.ends_at).setHours(0, 0, 0, 0);

    const select = knex
      .distinct(
        'dossier.starts_at as startAt',
        'dossier.ends_at as endAt',
        'dossier.dossier_num as dossierNum',
        'dossier_hotel.*',
        'client.name as client',
        'client.ref_client as clientRef',
        'hotel.name as hotel',
        'circuit.name as circuit',
        'city.name as city',
        'dossier.pax_num as paxNumber',
        'dossier.pax_num as paxNumber',
        'dossier.note as note',
      )
      .from('dossier')
      .leftJoin('dossier_hotel', 'dossier_hotel.dossier_id', '=', 'dossier.dossier_num')
      .leftJoin('client', 'client.id', '=', 'dossier.client_id')
      .leftJoin('circuit', 'circuit.id', '=', 'dossier.circuit_id')
      .leftJoin('hotel', 'hotel.id', '=', 'dossier_hotel.hotel_id')
      .leftJoin('city', 'city.id', '=', 'hotel.city_id')
      .where('dossier.starts_at', '>=', new Date(start_at))
      .andWhere('dossier.starts_at', '<=', new Date(end_at));

    const nbrpaxforhbtype = async (data) => {
      const newDataSet = []
      if (data.length !== 0) {
        data.forEach(async (item, index) => {
          const nbrpaxforhbtype = await knex.select('typepax', 'nbr').from('nbrpaxforhbtype').where("dossier_id", "=", item.dossierNum);
          newDataSet.push({ ...item, nbrpaxforhbtype })
          if (index === data.length - 1) {
            return await res.status(200).json({
              success: true,
              dossiers: newDataSet
            });
          }
        })
      } else {
        return res.status(200).json({
          success: true,
          dossiers: []
        });
      }
    }
    if (req.body.city_id === -1 && req.body.hotel_id === -1) {
      await select.then(nbrpaxforhbtype);
    } else if (req.body.city_id !== -1 && req.body.hotel_id === -1) {
      await select.andWhere('hotel.city_id', '=', `${req.body.city_id}`)
        .then(nbrpaxforhbtype);
    } else if (req.body.city_id !== -1 && req.body.hotel_id !== -1) {
      await select
        .andWhere('hotel.city_id', '=', `${req.body.city_id}`)
        .andWhere('hotel.id', '=', `${req.body.hotel_id}`)
        .then(nbrpaxforhbtype);
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error,
      success: false
    });
  }
};