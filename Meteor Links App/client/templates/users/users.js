Template.UsersCollectionDebug.helpers({
   usersList : function () {

       //   get all users from database for simple list

       return Users.find(
           {},
           {
               'services.google.name' : 1,
               'services.google.picture' : 1,
           }
       );
   }
});

Template.SingleUser.events({
   "click .add-friend" : function (event) {

       //   check if selected user is on current user friend list
       //   if not, add it to the list by calling addFriend(friendID)
       //   this should reduce database calls count
       //
       if(! _.contains(Meteor.user().profile.friends, event.target.value)) {
           Meteor.call("addFriend", event.target.value);
           // $(event.target).hide();
       }

   },
   "click .remove-friend" : function (event) {
      if(Users.isFriend(this._id)){
        Meteor.call("removeFriend", this._id)
      }
   }
});


Template.SingleUser.helpers({
    isFriend() {
      return Users.isFriend(this._id)
    }
});
