
class ActionButton{
  constructor(text, where, action, op ={enable: true, handleOnClient: false, icon : '', isPrimary: false}){
    //where => edit, view, listview, listrecord
    this.text = text;
    this.where = where;
    //arguments mapping from caller
    //Access Role Mapping => in database
  }
}

class  LinkActionButton extends ActionButton {
  constructor(text, where, uri, op ={enable: true, handleOnClient: false, icon : '', isPrimary: false, target: 'current'}) {
    super(text, where, uri, op);
    //target => current, modal, newtab
  }
}
