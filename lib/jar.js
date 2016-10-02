// In memory Jar
function Jar() {
  var items = [];

  function add(str) {
    items.push(str);
  }

  function remove(idx) {
    items.splice(idx, 1);
  }

  function list(idx) {
    return items;
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
    list: list,
    count: count,
    empty: empty,
  }
}

module.exports = Jar;