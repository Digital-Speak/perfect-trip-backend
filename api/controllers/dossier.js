const Dossier = require("../models/Dossier");
const flightController = require('./flight');
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
          ends_at: new Date(new Date(req.body.ends_at).setHours(0, 0, 0, 0)),
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
            req.body.dossier_id =  dossier_num[0].dossier_num;
            req.body.isFromDossier =  true;
            await flightController.addFlight(req,res,next);
            // await knex('flight').insert({
            //   city_id_start: 5,
            //   // city_id_start: req.body.city_id_start,
            //   from_start: req.body.from_start,
            //   to_start: req.body.to_start,
            //   flight_start: req.body.flight_start,
            //   flight_time_start: req.body.flight_time_start,
            //   from_to_start: req.body.from_to_start,
            //   dossier_id: dossier_num[0].dossier_num,
            //   city_id_end: 5,
            //   // city_id_end: req.body.city_id,
            //   flight_end: req.body.flight_end,
            //   from_end: req.body.from_end,
            //   to_end: req.body.to_end,
            //   from_to_end: req.body.from_to_end,
            //   flight_time_end: req.body.flight_time_end,
            // });
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

exports.updateDossier = async (req, res, next) => {
  try {
    console.log(req.body);
    // const updatedClient = client.updateCilent(req, res);
    // if (updatedClient) {
    // updatedClient.then(async (client) => {
    // if (!client || client.length === 0) return res.status(500).send({ success: false, message: "Opps, something went wrong!!" });
    // await knex('dossier')
    //   .update({
    //     starts_at: new Date(new Date(req.body.starts_at).setHours(0, 0, 0, 0)),
    //     ends_at: new Date(new Date(req.body.ends_at).setHours(0, 0, 0, 0)),
    //     circuit_id: req.body.circuit_id,
    //     agency_id: req.body.agency_id,
    //     note: req.body.note,
    //     updated_at: new Date()
    //   })
    //   .where({
    //     dossier_num: req.body.dossier_num
    //   })
    //   .returning('dossier_num')
    //   .then(async (dossier_num) => {
    //     console.log(83, dossier_num);
    //     // if (dossier_num[0].dossier_num !== req.body.dossier_num)
    //     //   return res.status(500).json({
    //     //     success: false,
    //     //     message: "An error occured while updating the dossier"
    //     //   });
    //     req.body.hotels_dossier.forEach(async (hotelForFolder) => {
    //       await knex('dossier_hotel')
    //         .update({
    //           dossier_id: hotelForFolder.dossier_num,
    //           extra_nights: hotelForFolder.extra_nights,
    //           hotel_id: hotelForFolder.hotel_id,
    //         })
    //         .where({
    //           dossier_id: req.body.dossier_num
    //         })
    //     });

    //     req.body.typeOfHb.forEach(async (item) => {
    //       await knex('nbrpaxforhbtype')
    //         .update({
    //           typepax: item.label,
    //           nbr: item.nbr,
    //         })
    //         .where({
    //           dossier_id: req.body.dossier_num
    //         })
    //     });
    //   });
    // return res.status(200).json({
    //   success: true,
    //   message: "Dossier updated successfully",
    // });
    // })
    // } else {
    //   return res.status(500).json({
    //     success: false,
    //     message: "An error occured while updating the dossier"
    //   });
    // }
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

exports.getDossier = async (req, res, next) => {
  try {
    await knex
      .distinct(
        'dossier.dossier_num as dossierNum',
        'dossier.starts_at as startAt',
        'dossier.ends_at as endAt',
        'client.category as category',
        'client.agency_id as agency_id',
        'agency.name as agency',
        'client.name as client_num',
        'client.ref_client as client_ref',
        'dossier.circuit_id',
        'circuit.name as circuit',
        'dossier.note as note',
      )
      .from('dossier')
      .leftJoin('dossier_hotel', 'dossier_hotel.dossier_id', '=', 'dossier.dossier_num')
      .leftJoin('client', 'client.id', '=', 'dossier.client_id')
      .leftJoin('agency', 'agency.id', '=', 'dossier.agency_id')
      .leftJoin('circuit', 'circuit.id', '=', 'dossier.circuit_id')
      .where("dossier_num", "=", req.body.dossier_num)
      .then(async (dossier) => {
        res.status(200).json({
          success: true,
          data: dossier
        });
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
      .andWhere('dossier.starts_at', '<=', new Date(end_at))
      .orderBy("dossier.starts_at ", "asc");

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


exports.getListDossiers = async (req, res, next) => {
  try {
    console.log(req.body)

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
        'dossier.note as note',
      )
      .from('dossier')
      .leftJoin('dossier_hotel', 'dossier_hotel.dossier_id', '=', 'dossier.dossier_num')
      .leftJoin('client', 'client.id', '=', 'dossier.client_id')
      .leftJoin('circuit', 'circuit.id', '=', 'dossier.circuit_id')
      // .where('dossier.starts_at', '>=', new Date(start_at))
      // .andWhere('dossier.starts_at', '<=', new Date(end_at))
      .orderBy("dossier.ends_at ", "asc");

    // const nbrpaxforhbtype = async (data) => {
    //   const newDataSet = []
    //   if (data.length !== 0) {
    //     data.forEach(async (item, index) => {
    //       const nbrpaxforhbtype = await knex.select('typepax', 'nbr').from('nbrpaxforhbtype').where("dossier_id", "=", item.dossierNum);
    //       newDataSet.push({ ...item, nbrpaxforhbtype })
    //       if (index === data.length - 1) {
    //         return await res.status(200).json({
    //           success: true,
    //           dossiers: newDataSet
    //         });
    //       }
    //     })
    //   } else {
    //     return res.status(200).json({
    //       success: true,
    //       dossiers: []
    //     });
    //   }
    // }

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