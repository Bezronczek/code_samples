/* jshint esnext:true */
Links = new Mongo.Collection('links');

if (Meteor.isServer) {
  Meteor.methods({

    addLink(link, category, display) {
      if (!Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
      }

      // perform data check
      check(validator.isURL(link), true);
      check(category, String);
      check(display, String);

      Links.insert({
        targetUrl: link,
        author: Meteor.user().profile.name,
        category: category,
        owner: Meteor.userId(),
        display: display,
        createdAt: new Date()
      });

    },

    //    This method is used to delete link with selected id

    deleteLink(linkId) {

      if (!Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
      } else if (Links.findOne(linkId).display != Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
      }
      check(linkId, String);
      Links.remove(linkId);
    },

    archiveLink(linkId) {
      if (!Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
      }
      check(linkId, String);
      if (Links.findOne(linkId).archived !== true) {
        Links.update(linkId, {
          $set: {
            archived: true
          }
        });
      } else {
        Links.update(linkId, {
          $set: {
            archived: false
          }
        });
      }
    }


  });
}
