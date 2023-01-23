const knex = require('../../db');

exports.addFlight = async (req, res, next) => {
  try {
    await knex('flight').insert({
      city_id_start: req.body.city_id_start,
      from_start: req.body.from_start,
      to_start: req.body.to_start,
      flight_start: req.body.flight_start,
      flight_time_start: req.body.flight_time_start,
      from_to_start: req.body.from_to_start,
      dossier_id: req.body.dossier_id,
      city_id_end: req.body.city_id_end,
      flight_end: req.body.flight_end,
      from_end: req.body.from_end,
      to_end: req.body.to_end,
      from_to_end: req.body.from_to_end,
      flight_time_end: req.body.flight_time_end,   
      flight_date_end: new Date(String(req.body.flight_date_end).split(' ').slice(0, 3).join(' ')),
      flight_date_start: new Date(String(req.body.flight_date_start).split(' ').slice(0, 3).join(' ')),   
    }).then(() => {
      if(!req.body.isFromDossier){
        res.status(200).json({
          success: true,
          message: "Flight added successfully",
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

exports.deleteFlight = async (req, res, next) => {
  try {
    await knex('flight')
      .where('id', req.body.id)
      .select("*").then(async (flight) => {
        if (flight.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Flight does not exist"
          });
        } else {
          await knex('flight')
            .where({ id: req.body.id })
            .del().then(() => {
              return res.status(200).json({
                success: true,
                message: "Flight deleted successfully"
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

// exports.editFlights = async (req, res, next) => {
//   try {
//     await knex('flight')
//       .where('id', req.body.id)
//       .select("*").then(async (flight) => {
//         if (flight.length === 0) {
//           return res.status(400).json({
//             success: false,
//             message: "Flight does not exist"
//           });
//         } else {
//           knex('flight')
//             .where({ id: req.body.id })
//             .update({}).then(() => {
//               return res.status(200).json({
//                 success: true,
//                 message: "Flight updated successfully"
//               });
//             });
//         }
//       })
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       error,
//     });
//   }
// };

exports.getFlights = async (req, res, next) => {
  try {
    await knex('flight')
      .distinct(
        'flight.id as flightId',
        'flight.from_start',
        'flight.to_start',
        'flight.flight_start',
        'flight.flight_time_start',
        'flight.flight_date_start',
        'flight.flight_date_end',
        'flight.from_to_start',
        'flight.dossier_id',
        'flight.city_id_end',
        'flight.city_id_start',
        'flight.flight_end',
        'flight.from_end',
        'flight.to_end',
        'flight.from_to_end',
        'flight.flight_time_end',
        'city1.name as cityName1',
        'client.name as client_name',
      )
      .leftJoin('city as city1', 'city1.id', '=', 'flight.city_id_start')
      .leftJoin('dossier as dossier', 'dossier.dossier_num', '=', 'flight.dossier_id')
      .leftJoin('client as client', 'client.id', '=', 'dossier.client_id')
      .orderBy('flightId','desc')
      .then(async (flight) => {
        if (flight.length === 0) {
          return res.status(400).json({
            success: false,
            message: "there is no flights"
          });
        } else {
          await knex('flight')
            .distinct(
              'flight.id as flightId2',
              'city2.name as cityName2',
            )
            .leftJoin('city as city2', 'city2.id', '=', 'flight.city_id_end')
            .orderBy('flightId2','desc')
            .then((secondRes) => {
              const flights = [];
              flight.forEach((element, index) => {
                  flights.push({...element, cityName2: secondRes[index].cityName2})
              });
              return res.status(200).json({
                success: true,
                flights
              });
            })
        }
      })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getFlightsFiltered = async (req, res, next) => {
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