Template.profileBar.helpers({
    profilePic : function () {

        if(! Meteor.userId()){
            throw new Meteor.Error("not-authorized");
        }

        return Meteor.user().services.google.picture;
    }
});

Template.navbar.events({
   'click li' : function (event) {
       $('li.active').removeClass('active');
       $(event.target).addClass('active');
   }
});

Template._loginButtonsLoggedInDropdown.events({
    'click #login-buttons-profile': function (event) {
        Router.go('myProfile');
    }
})
