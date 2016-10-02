const ActionDelegator = function(){
  const actions = {};

  function addAction(action, cb) {
    actions[action] = cb;
  }

  function parseMessage(message) {
    const strArr = message.split(' ');
    var actionName = strArr[0];
    var textArr = strArr.slice(1)
    
    // If this is a default action, set the action name and use the whole string as the action content
    // (since we've determined there's no preceeding action id)
    if(!actions.hasOwnProperty(actionName)) { 
      actionName = 'default'
      textArr = strArr;
    }

    return { name: actionName, content: textArr.join(' ') };
  }

  function delegate(message) {
    const action = parseMessage(message.text);
    if(actions.hasOwnProperty(action.name)){
      actions[action.name](message, action);
    } else if ( actions.hasOwnProperty('default') ) {
      actions['default'](message);
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