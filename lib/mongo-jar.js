// Jar that's persisted to the configured MONGODB_URI
var itemsCache = {};

// Methods for fetching and persisting data to the DB and/or in memory cache
function _persist(controller, message, items, cb) {
  itemsCache = items;
  return new Promise( function(resolve, reject) {
    controller.storage.teams.save(
      { id: message.channel, message: message, items: itemsCache }, 
      function(err) {
        if (err) reject(err)
      });
  });
}

function _get(controller, message) {
  const channelId = message.channel;
  const localItem = itemsCache[channelId];

  return new Promise( function(resolve, reject) {
    // If we have something in the local cache just update it and persist the modified object
    if( typeof localItem != 'undefined' ) {
      resolve(localItem.items)
    // otherwise we'll grab what's in mongo, set the cache, update it and persist that
    } else {
      controller.storage.teams.get(message.channel, function(err, team_data){
        if (err) {
          reject(err)
        }

        if (typeof team_data != 'undefined' && team_data !== null) {
          itemsCache[channelId] = team_data;
          resolve(team_data.items);
        } else {
          // Default empty object to push data into
          const teamData = {
            items: [],
            message: {},
          }
          itemsCache[channelId] = teamData;
          resolve(teamData.items);
        }
      });
    }
  });
}

function MongoJar(controller) {
  this.controller = controller;
  return this;
}

MongoJar.prototype.add = function(message, str) {
  const controller = this.controller;

  return new Promise(function(resolve, reject){
    _get(controller, message).then(function(teamItems){
      const itemsToPersist = teamItems.slice();
      itemsToPersist.push(str);
      _persist(controller, message, itemsToPersist)
      resolve(itemsToPersist);
    }).catch(function(err){
      console.log(err);
      reject(err);
    })
  });
}

// returnes true of false if a an index existed and was removed
MongoJar.prototype.remove = function(message, idx) {
  const controller = this.controller;
  const index = idx || null;

  return new Promise(function(resolve, reject){
    _get(controller, message).then(function(items){
      if (idx < items.length) {
        items.splice(idx, 1);
        _persist(controller, message, items);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

MongoJar.prototype.get = function(message, idx) {
  const controller = this.controller;
  const index = idx || null;

  return new Promise( function(resolve, reject){
    _get(controller, message).then(function(teamItems){
      const returnObj = (index) ? teamItems[index] : teamItems;
      resolve (returnObj)
    }).catch(function(err){ reject(err) });    
  });
}

MongoJar.prototype.empty = function(message) {
  _persist(this.controller, message, []);
}

MongoJar.prototype.count = function(message) {
  return new Promise( function(resolve, reject){
    _get(self.controller, message).then(function(teamItems){
      resolve(teamItems.length);
    }).catch(function(err){ console.log(err) });
  });
}

module.exports = MongoJar;