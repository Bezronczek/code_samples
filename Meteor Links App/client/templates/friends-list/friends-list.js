Template.FriendsList.helpers({
	friends: function () {
		// get userId from route for watching someones profile
		// or use current uers id for viewing own profile
		let _id = Router.current().params._id || Meteor.userId();
		return Users.getFriendsList(_id);
	},
	canEdit() {
		// check current route; if it's myProfile
		// if yes, then let's allow to remove friends from the list
		return Router.current().route._path === "/myProfile";
	}
});

Template.FriendsList.events({
	'click .remove': function () {
		if(Users.isFriend(this.id)){
			if(confirm("Are you sure?"))
        		Meteor.call("removeFriend", this.id)
      	}
	}
});