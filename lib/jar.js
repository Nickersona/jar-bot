// In memory Jar
function Jar() {
  var items = [];

  function add(str) {
    items.push(str);
  }

  function remove(idx) {
    var status = false;

    if (idx < items.length) {
      console.log('item is in bounds')
      items.splice(idx, 1);
      status = true;
    } 
    return status;
  }

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