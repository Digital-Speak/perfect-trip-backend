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
      city_id_end: req.body.city_id,
      flight_end: req.body.flight_end,
      from_end: req.body.from_end,
      to_end: req.body.to_end,
      from_to_end: req.body.from_to_end,
      flight_time_end: req.body.flight_time_end,   
    }).then(() => {
      return res.status(200).json({
        success: true,
        message: "Flight added successfully",
      });
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

// exports.editCity = async (req, res, next) => {
//   try {
//     await knex('city')
//       .where('id', req.body.id)
//       .select("*").then(async (city) => {
//         if (city.length === 0) {
//           return res.status(400).json({
//             success: false,
//             message: "City does not exist"
//           });
//         } else {
//           const updatedCity = new City({ name: req.body.name, updated_at: new Date() });
//           knex('city')
//             .where({ id: req.body.id })
//             .update(updatedCity).then(() => {
//               return res.status(200).json({
//                 success: true,
//                 message: "City updated successfully"
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
      .select("*").then(async (flight) => {
        if (flight.length === 0) {
          return res.status(400).json({
            success: false,
            message: "there is no flights"
          });
        } else {
          return res.status(200).json({
            success: true,
            flight
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