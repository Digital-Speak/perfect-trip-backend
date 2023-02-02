exports.addDossier = async (req, res, next) => {
 try {
  let circ_id = req.body.circuit_id
  const newClient = client.addClient(req, res);
  if (newClient) {
   newClient.then(async (client) => {
    const newDossier = new Dossier({
     dossier_num: req.body.dossier_num,
     starts_at: moment(new Date(new Date(req.body.starts_at).setHours(new Date(req.body.starts_at).getHours() + 1))).format("YYYY-MM-DD"),
     circuit_id: circ_id,
     agency_id: req.body.agency_id,
     pax_num: req.body.nbrPax,
     note: req.body.note,
     client_id: client[0].id,
     created_at: new Date(),
     updated_at: new Date(),
    });

    await knex('dossier').insert(newDossier)
     .returning('dossier_num')
     .then(async (dossier_num) => {
      req.body.dossier_id = dossier_num[0].dossier_num;
      req.body.isFromDossier = true;
      // await flightController.addFlight(req, res, next);
      let numberOfnights = 0;
      const circuit_cities = await getCircuitCity({
       circuit_id: req.body.circuit_id,
       cat: req.body.category,
      });

      circuit_cities.forEach(async (item, index) => {
       if (index == 0) {
        numberOfnights = 0;
       } else {
        numberOfnights = numberOfnights + item.number_of_nights;
       }
       const startAt = moment(new Date(new Date(req.body.starts_at)
        .setHours(new Date(req.body.starts_at).getHours() + parseInt(numberOfnights)))).format("YYYY-MM-DD");

       const endAt = moment(new Date(new Date(req.body.starts_at)
        .setHours(new Date(req.body.starts_at).getHours() + parseInt(numberOfnights) + (index + 1 < circuit_cities.length ? circuit_cities[index + 1] : 1)))).format("YYYY-MM-DD");

       await knex('dossier_hotel')
        .insert({
         dossier_id: req.body.dossier_id,
         extra_nights: 0,
         hotel_id: hotel_id,
         start_date: startAt,
         end_date: endAt,
         type_regime: hotelForFolder.regime
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

const getCircuitCity = async (req) => {
 try {
  await knex('circuit_city')
   .select(
    "circuit.id as circuit_id",
    "circuit.name as circuit",
    "city.id as city_id",
    "city.name as city",
    "circuit_city.number_of_nights as number_of_nights",
    "circuit_city.deleted as deleted",
    "hotel.name as hotel_id",
    "hotel.name as hotel",
    "hotel.stars as cat",
   )
   .leftJoin('city', 'city.id', '=', 'circuit_city.city_id')
   .leftJoin('circuit', 'circuit.id', '=', 'circuit_city.circuit_id')
   .leftJoin('hotel', 'hotel.city_id', '=', 'city.id')
   .where("circuit.is_special", "=", false)
   .andWere("circuit.id", "=", req.body.circuit_id)
   .andWere("hotel.stars", "=", req.body.cat)
   .returning("*")
   .then(async (response) => {
    return response;
   });
 } catch (error) {
  console.log(error);
  return res.status(500).json({
   error,
  });
 }
};