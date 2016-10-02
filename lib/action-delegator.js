const ActionDelegator = function(){
  const actions = {};

  function addAction(action, cb) {
    actions[action] = cb;
  }

  function parseMessage(message) {
    const strArr = message.split(' ');
    const textArr = strArr.slice(1)
    return { name: strArr[0], content: textArr.join(' ') };
  }

  function delegate(message, args) {
    const action = parseMessage(message);
    if(actions.hasOwnProperty(action.name)){
      actions[action.name](args, action);
    } else if ( actions.hasOwnProperty('default') ) {
      actions['default'](args);
    } else {
      console.log(action.name, ' is not registered on the ActionDelegator, try using addAction ' + 
        '("action", callbackfunc), Or set a default action which will catch all non registered actions')
    }
  }

  return {
    addAction: addAction,
    delegate: delegate,
  }
}

module.exports = ActionDelegator;