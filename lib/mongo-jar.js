// In memory MongoJar
function MongoJar(controller) {
  this.controller = controller;
  this.itemsCache = {};
  return this;
}

function _persist(controller, teamId, items, cb) {
  return new Promise( function(resolve, reject) {
    controller.storage.teams.save(
      { id: teamId, items: items }, 
      function(err) {
        if (err) reject(err)
      });
  });
}

function _get(controller, teamId) {
  return new Promise( function(resolve, reject) {
    controller.storage.teams.get(teamId, function(err, team_data){
      if (err) {
        reject(err)
      }
      resolve(team_data.items);
    });
  });
}

MongoJar.prototype.add = function(message, str) {
  const self = this;
  const controller = this.controller;
  const teamId = message.team_id;
  const localItem = self.itemsCache[teamId];

  return new Promise(function(resolve, reject){
    // If we have something in the local cache just update it and persist the modified object
    if( typeof localItem != 'undefined' ) {
      _persist(controller, teamId, localItem);
      resolve(localItem);
    // otherwise we'll grab what's in mongo, set the cache, update it and persist that
    } else {
      _get(controller, teamId).then(function(teamItems){
        const itemsToPersist = teamItems || [];
        self.itemsCache[teamId] = teamItems; // update the local cache
        itemsToPersist.push(str);
        _persist(controller, teamId, itemsToPersist)
        resolve(itemsToPersist);
      }).catch(function(err){
        console.log(err);
        reject(err);
      })
    }
  });
}

// returnes true of false if a an index existed and was removed
MongoJar.prototype.remove = function(message, idx) {
  const self = this;
  const controller = this.controller;
  const teamId = message.team_id;
  const localItems = this.itemsCache[teamId];
  const index = idx || null;

  return new Promise(function(resolve, reject){
    if( typeof localItem != 'undefined' ) {
      if (idx < localItems.length) {
        localItems.splice(idx, 1);
        _persist(controller, teamId, localItems);
        resolve(true)
      } else { resolve(false) }
    } else {
      _get(controller, teamId).then(function(items){
        if (idx < items.length) {
          items.splice(idx, 1);
          self.itemsCache[teamId] = items || []; // update the local cache
          _persist(controller, teamId, items);
          resolve(true);
        } else {
          resolve(false);
        }
      })
    }
  });
}

MongoJar.prototype.get = function(message, idx) {
  const self = this;
  const controller = this.controller;
  const teamId = message.team_id;
  const localItem = this.itemsCache[teamId];
  const index = idx || null;

  return new Promise( function(resolve, reject){
    if( typeof localItem != 'undefined' ) {
      const returnObj = (index) ? localItem[index] : localItem;
      resolve (returnObj)
    } else {
      _get(controller, teamId).then(function(teamItems){
        const returnObj = (index) ? teamItems[index] : teamItems;
        self.itemsCache[teamId] = teamItems || []; // update the local cache
        resolve (returnObj)
      }).catch(function(err){ reject(err) });    
    }
  });
}

MongoJar.prototype.empty = function(message) {
  this.itemsCache[message.team_id] = [];
  _persist(this.controller, message.team_id, []);
}

MongoJar.prototype.count = function(message) {
  return new Promise( function(resolve, reject){
    const self = this;
    const teamId = message.team_id;
    const localItem = this.itemsCache[teamId];
    if( typeof localItem != 'undefined' ) {
      console.log('Local check')
      resolve (localItem.length)
    } else {
      _get(self.controller, teamId).then(function(teamItems){
        console.log('MONGO check')
        self.itemsCache[teamId] = teamItems || []; // update the local cache
        resolve(teamItems.length);
      })
    }
  });
}

module.exports = MongoJar;