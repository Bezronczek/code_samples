/* jshint esnext:true */ // global config doesn't seem to work for this
/* jshint -W082 */ // Meteor specifies if code runs on server or client side - W082 throws error here
Users = Meteor.users;

///////////////////
//
// removed code goes here
//
///////////////////


if (Meteor.isServer) {

  function getFriends(userId) {
    // get friends list for selected user
    // if friends list is empty, pass an empty array
    // this aviods errors in console
    return Users.findOne(userId).profile.friends || []; //FIXME this should no longer throw an error as list always has at least one item
  }

  function getUsersNames(friendsArray) {
    // build array of full names of users basing on passed array
    return _.map(friendsArray, (user) => getUsername(user));
  }

  function getZippedUsers(userId) {
    let friendsArray = getFriends(userId);
    // return array of arrays [[id,name],...]
    return _.zip(friendsArray, getUsersNames(friendsArray));
  }

  function getUsername(user) {
    if (userExists(user)) {
      return Users.findOne(user).profile.name;
    } else {
      return "User Not Found";
    }
  }

  function userExists(user) {
    if ("undefined" === typeof Users.findOne(user)) {
      return false;
    } else {
      return true;
    }
  }
}

Users.getFriendsList = function(userId) {

  // map array of arrays to array of objects [{id:id, name:name},...]
  // pattern required for {{#each}} loop in HTML template
  // this assumes that we have ID in position [0], and username in [1]
  return _.map(getZippedUsers(userId), (item) => {
    return {
      id: item[0],
      name: item[1],
    };
  });
};

Users.isFriend = function(userId) {
  return (_.contains(Meteor.user().profile.friends, userId));
};
