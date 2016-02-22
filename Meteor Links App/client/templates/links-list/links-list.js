/* jshint esnext:true */
Template.LinksList.helpers({
    linksList () {

        //get links for current user
        if(Session.get("showArchived")) {
          return Links.find({
            display : Meteor.userId(),
            archived : true
          },
          { sort: { createdAt: -1 } }
          );

        } else {
          return Links.find(
            { display: Meteor.userId(),
              archived : { $ne: true }
            },
            { sort : { createdAt: -1} }
            );
        }

    },
    linkArchived() {
      return Links.findOne(this._id, {fields: {archived: 1}}).archived;
    }
});

Template.LinksList.events({
   "click .delete-link" : function () {

       //delete link from collection
       Meteor.call("deleteLink", this._id);

   },
   "click .archive-link" : function (){
    Meteor.call("archiveLink", this._id);
   }
});
