const router = require('express').Router();
const config = require('../db/connections');
const knex = require('knex')(config.development);
const joinsTablesRoute = require('./joinsTables');

router.route('/')
      .get(getUsedSeeds)
      .post(addUsedSeed);

router.route('/:id')
      .put(updateUsedSeed)
      .delete(deleteUsedSeed);

// get currently in use seeds in DB
function getUsedSeeds(req, res) {

  knex.select('actualharvestdate', 'amountharvested', 'amountharvestedunits', 'daystoharvest',
      'donation', 'family', 'field', 'generic', 'harvestduration', 'seeds_in_use_loc.id',
      'location_id', 'lotnumber', 'manufacturer', 'orderdate', 'plantdate', 'plantduration',
      'plantedassigndate', 'plantouse', 'projectedharvestdate', 'quantity', 'quantityunits',
       'receivedate', 'row', 'section', 'seeds_id', 'seedsinuse_id', 'seedsperunit',
       'supplier', 'transfer', 'unitsperpack', 'usedquantity', 'variety')
      .from('seedsinuse')
      .leftJoin('seeds', 'seedsinuse.seeds_id', 'seeds.id')
      .join('seeds_in_use_loc', 'seedsinuse.id', 'seeds_in_use_loc.seedsinuse_id')
      .join('location', 'seeds_in_use_loc.location_id', 'location.id')
      .then(function (response) {
        console.log('response', response);
        res.send(response);
      }).catch(function (err) {
        console.log('Error Querying the DB', err);
        res.sendStatus(500);
      });
};

// add seed in use to DB and set location
function addUsedSeed(req, res) {

  // object containing seed info and location info
  var newUsedSeed = {
    seed: {
      seeds_id: req.body.seedsId,
      transfer: req.body.transfer,
      usedquantity: req.body.usedquantity,
      plantedassigndate: req.body.plantedassigndate,
      plantdate: req.body.plantdate,
      plantduration: req.body.plantduration,
      projectedharvestdate: req.body.projectedharvestdate,
      actualharvestdate: req.body.actualharvestdate,
      amountharvested: req.body.amountharvested,
      amountharvestedunits: req.body.amountharvestedunits,
      harvestduration: req.body.harvestduration,
    },
    location_id: req.body.location_id,
  };

  // insert seed in use info in the db // return id number
  knex.insert(newUsedSeed.seed)
      .into('seedsinuse')
      .returning('*')
      .then(function (result) {
        console.log(result);
        newUsedSeed.seed.id = result[0].id;
        return newUsedSeed;
      })
      .then(joinsTablesRoute.joinsTable.seedLocationJoinTable)
      .then(function (result) {
        res.sendStatus(200);
      })
      .catch(function (err) {
        console.log('Error Querying the DB', err);
      });

};

function updateUsedSeed(req, res) {
  console.log('req.body seeds', req.body);
  var id = req.params.id;

  var updateUsedSeed = {
    seed: {
      seeds_id: req.body.seeds_id,
      transfer: req.body.transfer,
      usedquantity: req.body.usedquantity,
      plantedassigndate: req.body.plantedassigndate,
      plantdate: req.body.plantdate,
      plantduration: req.body.plantduration,
      projectedharvestdate: req.body.projectedharvestdate,
      actualharvestdate: req.body.actualharvestdate,
      amountharvested: req.body.amountharvested,
      amountharvestedunits: req.body.amountharvestedunits,
      harvestduration: req.body.harvestduration
    },
    seedsinuse_id: req.body.seedsinuse_id,
    location_id: req.body.location_id,
    join_id: req.body.joins_id
  };

  knex('seedsinuse').where('id', id)
                    .update(updateUsedSeed.seed)
                    .returning('*')
                    .then(function (result) {
                      return updateUsedSeed;
                    })
                    .then(joinsTablesRoute.joinsTable.updateSeedLocationJoinTable)
                    .then(function (result) {
                      res.sendStatus(200);
                    })
                    .catch(function (err) {
                      console.log('Error Querying the DB', err);
                    });
};

function deleteUsedSeed(req, res) {
  var id = req.params.id;

  var deleteSeed = {
    location_id: req.query.location_id,
    join_id: req.query.join_id
  };

  // delete seed in use
  knex('seedsinuse').where('id', id)
               .delete()
               .then(function () {
                  return deleteSeed;
                })
                .then(joinsTablesRoute.joinsTable.deleteSeedLocationJoinTable)
                .then(function (result) {
                  res.sendStatus(204);
                })
                .catch(function (err) {
                  console.log('Error Querying the DB', err);
                });
};

module.exports = router;
