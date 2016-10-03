// In memory Jar
function Jar() {
  var items = [];

  function add(str) {
    items.push(str);
  }

  // returnes true of false if a an index existed and was removed
  function remove(idx) {
    var status = false;

    if (idx < items.length) {
      items.splice(idx, 1);
      status = true;
    } 
    return status;
  }

  // defaults to getting all items, but will optionally take an index to return single item
  function get(idx) {
    const index = idx || null;
    if (index) {
      return items[index];
    } else {
      return items;
    }
  }

  function empty() {
    items = [];
  }

  function count() {
    return items.length;
  }

  return {
    add: add,
    remove: remove,
    get: get,
    count: count,
    empty: empty,
  }
}

module.exports = Jar;