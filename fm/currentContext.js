var getNamespace = require('continuation-local-storage').getNamespace;

module.exports = {
  getSession: function (key) {
    var session = getNamespace('contextspace');
    var se = session.get('session');
    if(key){
      if(se){
        return se[key];
      }
      else
        return null;
    }
    else
      return se;
  }
};
