angular.module('growLogApp')
       .service('seedsService', seedsService);

function seedsService($http) {
  var ctrl = this;

  var seeds = {
    allSeeds: [],
    usedSeeds: [],
    usedSeedsPlanted:[]
  };

  this.seeds = seeds;

  // get seeds from DB
  ctrl.getSeeds = function () {
    return $http.get('/addSeed')
      .then(function (response) {
        ctrl.seeds.allSeeds = [];

        seeds.allSeeds = response.data;

        seeds.allSeeds.forEach(function (currentSeed) {
          currentSeed.orderdate = moment(currentSeed.orderdate).format('L');
          currentSeed.receivedate = moment(currentSeed.receivedate).format('L');
        });

        return;
      }).catch(function (err) {
        console.log('err', err);
      });
  };

  // add new seed to the DB, then get seeds from DB
  ctrl.addSeed = function (data) {
    return $http.post('/addSeed', data)
      .then(function () {
        ctrl.getSeeds();
      }).catch(function (err) {
        console.log('err', err);
      });
  };

  ctrl.addUsedSeed = function (seedsdata) {
    return $http.post('/seedsInUse', seedsdata)
      .then(function (response) {
        ctrl.getUsedSeed();
        return response;
      });
  }; //end of addUsedSeeds

  // get used seeds fom DB
  this.getUsedSeed = function () {
    return $http.get('/seedsInUse').then(function (response) {
      ctrl.seeds.usedSeeds = [];
      ctrl.seeds.usedSeedsPlanted = [];

      let allTheSeeds = response.data


      allTheSeeds.forEach(function (currentSeed){
        currentSeed.plantedassigndate = moment(currentSeed.plantedassigndate).format('L');
        currentSeed.projectedharvestdate = moment(currentSeed.projectedharvestdate).format('L');
      });

      allTheSeeds.forEach(function (singleSeed) {
        if (!singleSeed.plantdate) {
          seeds.usedSeeds.push(singleSeed);
        } else {
          seeds.usedSeedsPlanted.push(singleSeed);
        }

      });

      return;
    }).catch(function (err) {
      console.log('err', err);
    });
  };

  // update used seed in DB
  ctrl.updateUsedSeed = function (usedSeedUpdate) {
    let id = usedSeedUpdate.seedsinuse_id;
    return $http.put('/seedsInUse/' + id, usedSeedUpdate).then(function (response) {
      ctrl.getUsedSeed();
    });
  };

  // initial get used seeds from DB
  ctrl.getUsedSeed();
  ctrl.getSeeds();

} //end of seedsService
