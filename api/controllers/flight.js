const knex = require('../../db');
const moment = require("moment");

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
      flight_date_end:
        moment(new Date(new Date(req.body.flight_date_end).setHours(new Date(req.body.flight_date_end).getHours() + 1))).format("YYYY-MM-DD"),
      flight_date_start:
        moment(new Date(new Date(req.body.flight_date_start).setHours(new Date(req.body.flight_date_start).getHours() + 1))).format("YYYY-MM-DD"),
    }).then(() => {
      if (!req.body.isFromDossier) {
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

exports.editFlight = async (req) => {
  try {
    return await knex('flight')
      .update({
        city_id_start: req.body.city_id_start,
        from_start: req.body.from_start,
        to_start: req.body.to_start,
        flight_start: req.body.flight_start,
        flight_time_start: req.body.flight_time_start,
        from_to_start: req.body.from_to_start,
        city_id_end: req.body.city_id_end,
        flight_end: req.body.flight_end,
        from_end: req.body.from_end,
        to_end: req.body.to_end,
        from_to_end: req.body.from_to_end,
        flight_time_end: req.body.flight_time_end,
        flight_date_end: moment(new Date(new Date(req.body.flight_date_end).setHours(new Date(req.body.flight_date_end).getHours() + 1))).format("YYYY-MM-DD"),
        flight_date_start: moment(new Date(new Date(req.body.flight_date_start).setHours(new Date(req.body.flight_date_start).getHours() + 1))).format("YYYY-MM-DD"),
      })
      .where({ dossier_id: req.body.dossier_id });
  } catch (error) {
    console.log(error);
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
        'client.ref_client as clientRef',
      )
      .leftJoin('city as city1', 'city1.id', '=', 'flight.city_id_start')
      .leftJoin('dossier as dossier', 'dossier.dossier_num', '=', 'flight.dossier_id')
      .leftJoin('client as client', 'client.id', '=', 'dossier.client_id')
      .orderBy('flightId', 'desc')
      .where('dossier.deleted', "!=", "true")
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
            .orderBy('flightId2', 'desc')
            .then((secondRes) => {
              const flights = [];
              flight.forEach((element, index) => {
                flights.push({ ...element, cityName2: secondRes[index].cityName2 })
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