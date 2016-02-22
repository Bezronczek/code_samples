Template.UserProfile.helpers({
	name() {
		return Meteor.user().profile.name;
	}
});

Template.UserProfile.events({
	"submit #userProfile" : function (event){
		// prevent submitting form
		event.preventDefault();
		// get new name for the user
		let newName = event.target.username.value
		// update current user data; for now it handles username only
		Meteor.call("updateCurrentUser", newName);
	}
})