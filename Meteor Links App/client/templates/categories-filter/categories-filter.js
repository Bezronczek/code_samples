Template.CategoriesFilter.events({
	'click .js-archived-false': function (event) {
		Session.set("showArchived", true);

		$(event.target).addClass("active")
		.removeClass("js-archived-false")
		.addClass("js-archieved-true");
	},
	'click .js-archieved-true' : function(event){
		Session.set("showArchived", false);

		$(event.target).removeClass("active")
		.removeClass("js-archieved-true")
		.addClass("js-archived-false");
	}
});
