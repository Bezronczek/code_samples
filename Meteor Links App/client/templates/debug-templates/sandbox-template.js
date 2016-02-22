/* jshint esnext:true */

Template.SandboxTemplate.events({
  "keyup #userSearch" : function(event) {
    const searchText = event.target.value;
    if(searchText !== '') {
      let users = Users.find({"profile.name" : new RegExp(searchText, "i")}).fetch();
      let list = users.map(user => {
        return {
          "name": user.profile.name,
          "_id": user._id
        };
      });
      Session.set('searchResult', list);
    } else {
      Session.set('searchResult', '');
    }
  }
});

Template.SandboxTemplate.helpers({
  searchResult() {
    return Session.get('searchResult');
  }
});
