const ActionDelegator = function(){
  const actions = {};

  function addAction(name, cb) {
    actions[name] = cb;
  }

  function parseMessage(message) {
    const strArr = message.split(' ');
    var actionName = strArr[0];
    var textArr = strArr.slice(1)
    var args = [];
    
    // If this is a default action, set the action name and use the whole string as the action content
    // (since we've determined there's no preceeding action id)
    if(!actions.hasOwnProperty(actionName)) { 
      actionName = 'default'
      textArr = strArr;
    }

    // Grab the contents of the first ( ) block in the message. Separate out arguments on comma
    // and pass it back via the action object
    const parensPattern = /\((.*?)\)/;
    const string = textArr.join(' ');
    const parensMatch = string.match(parensPattern)
    if (parensMatch) {
      args = parensMatch[1].split(',')
    }

    return { 
      name: actionName, 
      content: textArr.join(' '),
      arguments: args, 
    };
  }

  function delegate(bot, message) {
    const action = parseMessage(message.text);
    if(actions.hasOwnProperty(action.name)){
      actions[action.name](bot, message, action);
    } else if ( actions.hasOwnProperty('default') ) {
      actions['default'](bot, message);
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