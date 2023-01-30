const Dossier = require("../models/Dossier");
const Circuit = require("../models/Circuit");
const flightController = require('./flight');
const knex = require('../../db');
const client = require('./client');
const moment = require("moment");

exports.addDossier = async (req, res, next) => {
  try {
    let circ_id = req.body.circuit_id
    if (parseInt(req.body.circuit_id) === -99) {
      await knex('circuit')
        .where('name', req.body.circuit_name)
        .select("*")
        .where("is_special", "=", true)
        .then(async (circuit) => {
          if (circuit.length !== 0) {
            circ_id = circuit[0]?.id
          } else {
            const newCircuit = new Circuit({ name: req.body.circuit_name, created_at: new Date(), updated_at: new Date() });
            await knex('circuit').insert({ ...newCircuit, is_special: true }).returning("*").then((data) => {
              if (data.length != 0) {
                circ_id = data[0].id
              }
            });
          }
        });
    }

    const newClient = client.addClient(req, res);
    if (newClient) {
      newClient.then(async (client) => {
        const newDossier = new Dossier({
          dossier_num: req.body.dossier_num,
          starts_at: moment(new Date(new Date(req.body.starts_at).setHours(new Date(req.body.starts_at).getHours() + 1))).format("YYYY-M-D"),
          ends_at: moment(new Date(new Date(req.body.ends_at).setHours(new Date(req.body.ends_at).getHours() + 1))).format("YYYY-M-D"),
          circuit_id: circ_id,
          agency_id: req.body.agency_id,
          pax_num: req.body.nbrPax,
          note: req.body.note,
          client_id: client[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        })

        await knex('dossier').insert(newDossier)
          .returning('dossier_num')
          .then(async (dossier_num) => {
            req.body.dossier_id = dossier_num[0].dossier_num;
            req.body.isFromDossier = true;
            await flightController.addFlight(req, res, next);
            req.body.hotels_dossier.forEach(async (hotelForFolder) => {
              let hotel_id = hotelForFolder.hotel_id;
              let hotelForFolderFrom = new Date(hotelForFolder.from).setHours(new Date(hotelForFolder.from).getHours() + 1)
              let hotelForFolderTo = new Date(hotelForFolder.to).setHours(new Date(hotelForFolder.to).getHours() + 1)

              await knex('dossier_hotel')
                .insert({
                  dossier_id: hotelForFolder.dossier_num,
                  extra_nights: hotelForFolder.extra_nights,
                  hotel_id: hotel_id,
                  start_date: moment(new Date(new Date(hotelForFolderFrom).setHours(new Date(hotelForFolderFrom) + 1))).format("YYYY-M-D"),
                  end_date: moment(new Date(new Date(hotelForFolderTo).setHours(new Date(hotelForFolderTo) + 1))).format("YYYY-M-D"),
                  type_regime: hotelForFolder.regime
                }).then(async () => {
                  if (parseInt(req.body.circuit_id) === -99) {
                    const a = moment(moment(new Date(hotelForFolderFrom)).format("YYYY-M-D"));
                    const b = moment(moment(new Date(hotelForFolderTo)).format("YYYY-M-D"));
                    const number_of_nights = b.diff(a, 'days');
                    await knex('circuit_city').insert({
                      circuit_id: circ_id,
                      city_id: hotelForFolder.cityId,
                      number_of_nights: number_of_nights,
                    })
                  }
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

exports.updateDossier = async (req, res, next) => {
  try {

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
            .update({
              deleted: req.body.state,
            })
            .then(() => {
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
            dossier_num: 1
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

exports.getDossier = async (req, res, next) => {
  try {
    await knex
      .distinct(
        'dossier.dossier_num as dossierNum',
        'dossier.starts_at as startAt',
        'dossier.ends_at as endAt',
        'client.category as category',
        'dossier.agency_id as agency_id',
        'agency.name as agency',
        'client.name as client_name',
        'client.ref_client as client_ref',
        'dossier.circuit_id as circuit_id',
        'circuit.name as circuit',
        'dossier.note as note',
        'dossier.deleted as deleted',
        'flight.*'
      )
      .from('dossier')
      .leftJoin('client', 'client.id', '=', 'dossier.client_id')
      .leftJoin('agency', 'agency.id', '=', 'dossier.agency_id')
      .leftJoin('flight', 'flight.dossier_id', '=', 'dossier.dossier_num')
      .leftJoin('circuit', 'circuit.id', '=', 'dossier.circuit_id')
      .where("dossier_num", "=", req.body.id)
      .then(async (dossier) => {
        if (dossier[0].dossierNum == undefined) {
          await res.status(200).json({
            success: false,
            data: [],
            nbrpaxforhbtype: [],
            circuits: []
          });
        } else {
          const circuits = await knex
            .distinct(
              'city.name as city',
              'hotel.name as hotel',
              'hotel.id as hotel_id',
              'city.id as city_id',
              'circuit_city.number_of_nights as number_of_nights',
              'dossier_hotel.type_regime as regime',
              'circuit_city.id',
              'dossier_hotel.dossier_id',
            )
            .from('dossier_hotel')
            .leftJoin('hotel', 'hotel.id', '=', 'dossier_hotel.hotel_id')
            .leftJoin('city', 'city.id', '=', 'hotel.city_id')
            .leftJoin('circuit_city', 'circuit_city.city_id', '=', 'city.id')
            .where("dossier_hotel.dossier_id", "=", dossier[0].dossierNum)
            .orderBy("circuit_city.id", "asc");
          const nbrpaxforhbtype = await knex.select('typepax', 'nbr').from('nbrpaxforhbtype').where("dossier_id", "=", dossier[0].dossierNum);
          console.log({
            success: true,
            data: dossier,
            nbrpaxforhbtype: nbrpaxforhbtype,
            circuits: circuits
          })
          await res.status(200).json({
            success: true,
            data: dossier,
            nbrpaxforhbtype: nbrpaxforhbtype,
            circuits: circuits
          });
        }
      })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
      success: false
    });
  }
};

exports.getDossiers = async (req, res, next) => {
  try {
    const select = knex
      .distinct(
        'dossier.dossier_num as dossierNum',
        'dossier.circuit_id as circuit_id',
        'dossier.pax_num as paxNumber',
        'dossier.note as note',
        'client.category as category',
        'client.name as client',
        'client.ref_client as clientRef',
        'hotel.name as hotel',
        'hotel.id as hotel_id',
        'circuit.name as circuit',
        'city.name as city',
        'city.id as city_id',
        'dossier_hotel.start_date as startAt',
        'dossier_hotel.end_date as endAt'
      )
      .from('dossier')
      .leftJoin('dossier_hotel', 'dossier_hotel.dossier_id', '=', 'dossier.dossier_num')
      .leftJoin('client', 'client.id', '=', 'dossier.client_id')
      .leftJoin('circuit', 'circuit.id', '=', 'dossier.circuit_id')
      .leftJoin('hotel', 'hotel.id', '=', 'dossier_hotel.hotel_id')
      .leftJoin('city', 'city.id', '=', 'hotel.city_id')
      .orderBy('dossier_hotel.start_date', 'asc');

    const selectCiructs = async (data) => {
      const newDataSet = []
      if (data?.length !== 0) {
        data?.forEach(async (item, index) => {
          const nbrpaxforhbtype = await knex.select('typepax', 'nbr').from('nbrpaxforhbtype')
            .where("dossier_id", "=", item.dossierNum);
          newDataSet.push({ ...item, nbrpaxforhbtype })
          if (index === data.length - 1) {
            const newData = [];
            newDataSet.forEach((item) => {
              if (moment(new Date(item.startAt)).isSameOrAfter(new Date(req.body.starts_at), "day") && moment(new Date(item.startAt)).isSameOrBefore(new Date(req.body.ends_at), "day")) {
                newData.push(item);
              }
            });
            return await res.status(200).json({
              success: true,
              dossiers: newData.sort(function (a, b) {
                return new Date(a.startAt) - new Date(b.startAt);
              })
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

    if (req.body.city_id == -1 && req.body.hotel_id == -1) {
      await select.where('dossier.deleted', "!=", "true").then(selectCiructs);
    } else
      if (req.body.city_id != -1 && req.body.hotel_id == -1) {
        await select.andWhere('dossier.deleted', "!=", "true").andWhere('hotel.city_id', '=', `${req.body.city_id}`).then(selectCiructs);
      } else
        if (req.body.city_id == -1 && req.body.hotel_id != -1) {
          await select.andWhere('dossier.deleted', "!=", "true").andWhere('dossier_hotel.hotel_id', '=', `${req.body.hotel_id}`).then(selectCiructs);
        } else
          if (req.body.city_id != -1 && req.body.hotel_id != -1) {
            await select.andWhere('dossier.deleted', "!=", "true").andWhere('hotel.city_id', '=', `${req.body.city_id}`).andWhere('dossier_hotel.hotel_id', '=', `${req.body.hotel_id}`).then(selectCiructs);
          }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error,
      success: false
    });
  }
};

exports.getListDossiers = async (req, res, next) => {
  try {
    const select = knex
      .distinct(
        'dossier.dossier_num as dossier_num',
        'dossier.starts_at as startAt',
        'dossier.ends_at as endAt',
        'client.ref_client as clientRef',
        'client.category as category',
        'client.name as client',
        'circuit.name as circuit',
        'dossier.pax_num as paxNumber',
        'dossier.circuit_id as circuit_id',
        'dossier.note as note',
      )
      .from('dossier')
      .leftJoin('dossier_hotel', 'dossier_hotel.dossier_id', '=', 'dossier.dossier_num')
      .leftJoin('client', 'client.id', '=', 'dossier.client_id')
      .leftJoin('circuit', 'circuit.id', '=', 'dossier.circuit_id')
      .where('dossier.deleted', "!=", "true")
      .orderBy("dossier.ends_at ", "asc");
    return await res.status(200).json({
      success: true,
      dossiers: await select
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({
      error,
      success: false
    });
  }
}
