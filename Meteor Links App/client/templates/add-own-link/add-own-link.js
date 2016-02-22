/* jshint esnext:true */
Template.AddOwnLink.helpers({
  categoryList: ["Music", "Video", "Article", "Image", "Website", "Other"],

  friendList() {
    return [{
      id: Meteor.userId(),
      name: "Send to Me"
    }].concat(Users.getFriendsList(Meteor.userId()));
  },

  linkSentTo() {
    return Session.get('linkSentTo');
  }
});

Template.AddOwnLink.events({
  "submit #addLinkForm": function(event) {
    //prevent submit
    event.preventDefault();

    const link = event.target.text.value;
    const category = event.target.categoriesSelect.value;
    const displayTo = event.target.friendSelect.value;

    //check if input box is not empty and matches URL pattern
    //use validator.js for URL match
    const linkOptions = {require_protocol: true};
    if (validator.isURL(link)) {
      //add a link for current user
      Meteor.call("addLink", link, category, displayTo);
      //clear form  input field
      event.target.text.value = "";

      Session.set('linkSentTo', Users.findOne(displayTo).profile.name);
      $("#addLinkSuccessFrame").removeClass("hidden");
      //some conditions for keeping proper error frame visibility
      $("#addLinkErrorFrame").addClass("hidden");
    } else if (!validator.isURL(link) && link !== "") {
      $("#addLinkErrorFrame").removeClass("hidden");
    } else if (!validator.isURL(link) && link === "") {
      $("#addLinkErrorFrame").addClass("hidden");
    }
  },

  "click #addLinkSuccessFrame .glyphicon-remove": function(event) {
    $("#addLinkSuccessFrame").addClass("hidden");
  },
  "click #addLinkErrorFrame .glyphicon-remove": function(event) {
    $("#addLinkErrorFrame").addClass("hidden");
  }
});
