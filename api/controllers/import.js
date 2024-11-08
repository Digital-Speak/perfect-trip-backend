const Dossier = require("../models/Dossier");
const flightController = require('./flight');
const knex = require('../../db');
const client = require('./client');
const moment = require("moment");
var _ = require('lodash');

exports.addDossier = async (req, res, next) => {
  try {
    let circ_id = req.body.circuit_id
    const newClient = await client.addClient(req, res);
    if (newClient) {
      const newDossier = new Dossier({
        dossier_num: req.body.dossier_num,
        starts_at: moment(new Date(new Date(req.body.starts_at).setHours(new Date(req.body.starts_at).getHours() + 1))).format("YYYY-MM-DD"),
        circuit_id: circ_id,
        agency_id: req.body.agency_id,
        pax_num: req.body.nbrPax,
        note: req.body.note,
        client_id: newClient[0]?.id,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await knex('dossier').insert(newDossier)
        .returning('dossier_num')
        .then(async (dossier_num) => {
          req.body.dossier_id = dossier_num[0].dossier_num;
          req.body.isFromDossier = true;
          let numberOfnights = 0;
          let lastEndDate;
          const circuit_cities = await getCircuitCity({
            circuit_id: req.body.circuit_id,
            cat: req.body.category,
          });

          circuit_cities.sort((a, b) => parseInt(a.city_id) - parseInt(b.city_id));

          let grouped = _.mapValues(_.groupBy(circuit_cities, 'circuit_city_id'), clist => clist.map(city => _.omit(city, 'circuit_city_id')));

          const keys = Object.keys(grouped);

          const dataSet = [];
          keys.forEach(async (key, index) => {
            let startAt;
            let endAt;
            if (parseInt(index) === 0) {
              startAt = moment(new Date(new Date(req?.body?.starts_at))).format("YYYY-MM-DD");
              endAt = moment(new Date(new Date(req?.body?.starts_at)
                .setDate(new Date(req?.body?.starts_at).getDate() + parseInt(grouped[key][0]?.number_of_nights)))).format("YYYY-MM-DD");
              lastEndDate = endAt;
              dataSet.push({
                dossier_id: req.body.dossier_id,
                extra_nights: 0,
                city_id: grouped[key][0].city_id,
                hotel_id: grouped[key][0].hotel_id,
                hotel_name: grouped[key][0].hotel,
                start_date: startAt,
                end_date: endAt,
                type_regime: "DP"
              });
            }
            else {
              startAt = lastEndDate;
              // numberOfnights = parseInt(numberOfnights) + ;
              endAt = moment(new Date(new Date(lastEndDate)
                .setDate(new Date(lastEndDate).getDate() + parseInt(parseInt(grouped[key][0].number_of_nights))))).format("YYYY-MM-DD");

              lastEndDate = endAt;

              if (parseInt(index) === parseInt(keys.length - 1)) {
                dataSet.push({
                  dossier_id: req.body.dossier_id,
                  extra_nights: 0,
                  city_id: grouped[key][0].city_id,
                  hotel_id: grouped[key][0].hotel_id,
                  hotel_name: grouped[key][0].hotel,
                  start_date: startAt,
                  end_date: endAt,
                  type_regime: "DP"
                });
              }
            }

            if (parseInt(grouped[key][0].city_id) === 17 || parseInt(grouped[key][0].city_id) === 18) {
              if (req?.body?.desert === "SI") {
                const hotels = await getHotels(17, req.body.category);
                await knex('dossier_hotel')
                  .insert({
                    dossier_id: req.body.dossier_id,
                    extra_nights: 0,
                    hotel_id: hotels[0]?.id,
                    start_date: startAt,
                    end_date: endAt,
                    type_regime: "DP",
                  });
              } else {
                const hotels = await getHotels(18, req.body.category);
                await knex('dossier_hotel')
                  .insert({
                    dossier_id: req.body.dossier_id,
                    extra_nights: 0,
                    hotel_id: hotels[0]?.id,
                    start_date: startAt,
                    end_date: endAt,
                    type_regime: "DP",
                  });
              }
            } else if (parseInt(grouped[key][0].city_id) !== 17 && parseInt(grouped[key][0].city_id) !== 18) {
              await getHotels(grouped[key][0].city_id, req.body.category);
              await knex('dossier_hotel')
                .insert({
                  dossier_id: req.body.dossier_id,
                  extra_nights: 0,
                  hotel_id: grouped[key][0].hotel_id,
                  start_date: startAt,
                  end_date: endAt,
                  type_regime: "DP",
                });
            }
          });

          await knex('nbrpaxforhbtype')
            .insert({
              typepax: "SGL",
              nbr: req?.body?.typeOfHb?.filter((item) => item?.label == "SGL")?.length != 0
                ? req?.body?.typeOfHb?.filter((item) => item?.label == "SGL")[0]?.nbr : 0,
              dossier_id: dossier_num[0].dossier_num,
            });

          await knex('nbrpaxforhbtype')
            .insert({
              typepax: "DBL",
              nbr: req?.body?.typeOfHb?.filter((item) => item?.label == "DBL")?.length != 0
                ? req?.body?.typeOfHb?.filter((item) => item?.label == "DBL")[0]?.nbr : 0,
              dossier_id: dossier_num[0].dossier_num,
            });

          await knex('nbrpaxforhbtype')
            .insert({
              typepax: "TWIN",
              nbr: req?.body?.typeOfHb?.filter((item) => item?.label == "TWIN")?.length != 0
                ? req?.body?.typeOfHb?.filter((item) => item?.label == "TWIN")[0]?.nbr : 0,
              dossier_id: dossier_num[0].dossier_num,
            });

          await knex('nbrpaxforhbtype')
            .insert({
              typepax: "TRPL",
              nbr: req?.body?.typeOfHb?.filter((item) => item?.label == "TRPL")?.length != 0
                ? req?.body?.typeOfHb?.filter((item) => item?.label == "TRPL")[0]?.nbr : 0,
              dossier_id: dossier_num[0].dossier_num,
            });

          await knex('dossier')
            .update({
              ends_at: dataSet[dataSet.length - 1]?.end_date,
            })
            .where({
              dossier_num: req.body.dossier_num,
            })
            ;

          req.body = {
            ...req.body,
            city_id_start: dataSet[0].city_id,
            city_id_end: dataSet[dataSet.length - 1]?.city_id,
            from_start: "Airport",
            to_start: dataSet[0].hotel_name,
            flight_start: "-",
            flight_time_start: "00:00",
            from_to_start: "APT / HOTEL",
            dossier_id: dossier_num[0].dossier_num,
            flight_end: "-",
            from_end: dataSet[dataSet.length - 1].hotel_name,
            to_end: "Airport",
            from_to_end: "HOTEL / APT",
            flight_time_end: "00:00",
            flight_date_end: dataSet[dataSet.length - 1].end_date,
            flight_date_start: dataSet[0].start_date,
          };

          await flightController.addFlight(req, res, next);
        });
      return res.status(200).json({
        success: true,
        message: "Dossier added successfully",
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "An error occured while addind the client"
      });
    }
  } catch (error) {
    console.log(req.body.dossier_num, error);
    return res.status(500).json({
      error,
    });
  }
};

const getCircuitCity = async (req) => {
  try {
    return await knex
      .select(
        "circuit_city.id as circuit_city_id",
        "circuit.id as circuit_id",
        "circuit.name as circuit",
        "city.id as city_id",
        "city.name as city",
        "circuit_city.number_of_nights as number_of_nights",
        "circuit_city.deleted as deleted",
        "hotel.id as hotel_id",
        "hotel.name as hotel",
        "hotel.stars as cat",
      )
      .from('hotel')
      .leftJoin('city', 'city.id', '=', 'hotel.city_id')
      .leftJoin(
        'circuit_city',
        'circuit_city.city_id',
        '=',
        'city.id'
      )
      .leftJoin(
        'circuit',
        'circuit.id',
        '=',
        'circuit_city.circuit_id'
      )
      .where('circuit.id', '=', req.circuit_id)
      .andWhere('hotel.stars', 'like', `%${req.cat}%`)
      .groupBy(
        'circuit.id',
        'circuit.name',
        'city.name',
        'hotel.name',
        'circuit_city.number_of_nights',
        'city.id',
        'hotel.id',
        'circuit_city.id',
        'hotel.stars'
      ).orderBy('city.id');
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

const getHotels = async (city_id, cat) => {
  try {
    return await knex
      .select("*")
      .from('hotel')
      .where('hotel.city_id', '=', city_id)
      .andWhere('hotel.stars', 'like', `%${cat}%`)
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};
