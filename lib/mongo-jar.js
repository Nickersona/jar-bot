const _ = require('../node_modules/lodash');
const logger = require('./logger.js');

// Jar that's persisted to the configured MONGODB_URI
var itemsCache = {};


// Duplicate error thrown when a jar is found to contain two of the same items
function DupeError(message) {
  this.name = 'DupeError';
  this.message = message || 'User submitted a command which resulted in duplicate items in the Jar';
  this.stack = (new Error()).stack;
}

DupeError.prototype = Object.create(Error.prototype);
DupeError.prototype.constructor = DupeError;

// Methods for fetching and persisting data to the DB and/or in memory cache
function _persist(controller, message, items, cb) {
  logger.log('PERSIST');

  const channelId = message.channel
  return new Promise( function(resolve, reject) {
    const uniqItems = _.uniq(items);
    const foundDupe = uniqItems.length !== items.length;

    if(foundDupe) {
      reject(new DupeError());
    }
    itemsCache[channelId] =  uniqItems;
    
    logger.log('ITEM TO PERSIST:', {channelId, items, uniqItems});
    logger.log('UPDATE ITEM CACHE:', itemsCache);
    
    controller.storage.teams.save(
      { 
        id: channelId, 
        items: itemsCache[channelId],
      },
      function(err) {
        if (err) reject(err)
      }
    );

    resolve();
  });
}


function _get(controller, message) {
  logger.log('GET');

  const channelId = message.channel;
  const localItems = itemsCache[channelId];
  return new Promise( function(resolve, reject) {
    // If we have something in the local cache just update it and persist the modified object
    if( typeof localItems != 'undefined' ) {
      logger.log('PULLING FROM LOCAL CACHE:', localItems)
      resolve(localItems)
    // otherwise we'll grab what's in mongo, set the cache, update it and persist that
    } else {
      controller.storage.teams.get(channelId, function(err, team_data){
        if (err) {
          logger.log('GET ERROR:', err)
          reject(err)
        }

        if (!_.isNull(team_data) && !_.isNull(team_data.items)) {
          logger.log('DB ENTRY EXISTS, UPDATE LOCAL CACHE:', team_data)
          itemsCache[channelId] = team_data.items;
          resolve(team_data.items);
        } else {
          // Create an empty array entry for the found channelId
          const defaultVal = [];
          itemsCache[channelId] = defaultVal;
          logger.log('NEW CHANNEL, CREATE THE EMPTY ITEM', itemsCache)
          resolve(defaultVal);
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
        .then(() => resolve(itemsToPersist))
        .catch((err) => {
          reject(err);
        })
      ;
    }).catch(function(err){
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
    }).catch(function(err){ logger.log(err) });
  });
}

module.exports = MongoJar;