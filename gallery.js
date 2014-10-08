/*
File: gallery.js
Description: Evothings Gallery JavaScript code.
Author: Eric Svensson
Copyright (c) 2013-2014 Evothings AB
*/

var galleryURLBase = 'http://evothings.com/gallery'
	if (window.location.pathname.match(/gallery.html/))
		galleryURLBase = 'gallery.html'

var shareProjectURLBase = 'http://evothings.com/gallery/project/'

window.___gcfg = {
	parsetags: 'explicit'
};

;$(function()
{

	/*  If specified that only a certain project should be shown... */
	var projectMatches = /project\/(.*)/.exec(window.location.pathname)
	project = (projectMatches != null ?
		decodeURIComponent(projectMatches[1]) : null)
	project = ($.QueryString["project"] ? $.QueryString["project"] : project)

	/*  If specified that only items with certain
		tags should be shown and the current item doesn't contain those
		tags then continue to the next item. */
	var tagsMatches = /tag\/(.*)/.exec(window.location.pathname)
	tags = (tagsMatches != null ? tagsMatches[1] : null)
	tags = ($.QueryString["showtags"] ? $.QueryString["showtags"] : tags)

	/*  If specified that only items lacking certain
		tags should be shown and the current item contains one or more
		of those tags then continue to the next item. */
	var notagsMatches = /notag\/(.*)/.exec(window.location.pathname)
	notags = (notagsMatches != null ? notagsMatches[1] : null)
	notags = ($.QueryString["hidetags"] ? $.QueryString["hidetags"] : notags)

	/*  On the website the tag and project filter URLs are made like paths,
		while in the app they're made like query strings. */
	var tagURLPrefix = '?showtags='
	if (!window.location.pathname.match(/gallery.html/))
		tagURLPrefix = '/gallery/tag/'

	/*  On the website the project filter URLs are made like paths, while in
		the app they're made like query strings. */
	var projectURLPrefix = '?project='
	if (!window.location.pathname.match(/gallery.html/))
		projectURLPrefix = '/gallery/project/'

	/*  When accessed through Evothings Client, the 'etc' query string is
		provided. */
	var etc = $.QueryString['etc']
	
	if (etc)
		$('.evo-gallery').addClass('etc')

	if (project)
		$('.evo-gallery').addClass('single_item')

	$('#clear_filter_button').click(function() {
		window.location.href = galleryURLBase + (etc ? '?etc=1' : '')
	})

	if (project || tags || notags) {
		$('#clear_filter_button').addClass('visible')
		if (tags) {
			$('#filter_indicator').addClass('visible')
			$('#filter_indicator span').text('#' + tags)
		}
	}

	$.getJSON("gallery.json", function(data) {

		var $list = $("#evo-gallery-list")
		var $listItemTemplate = $("#list_item_template")
		var $resourceTemplate = $("#list_item_template .resource")

		$.each(data.items, function(key, item)
		{

			/* If current item doesn't match project filter, skip it. */
			if (item.title && project &&
				item.title.toLowerCase() !=
					project.replace('-', ' ').toLowerCase())
				return true // same as 'continue' in a native JS loop

			/* If current item doesn't match tag filter, skip it. */
			if (item.tags && tags &&
				($.arrayIntersect(
					item.tags.split(','),
					tags.split(','))
				).length == 0)
				return true // same as 'continue' in a native JS loop

			/* If current item matches tag exclusion filter, skip it. */
			if (item.tags && notags &&
				($.arrayIntersect(
					item.tags.split(','),
					notags.split(','))
				).length > 0)
				return true // same as 'continue' in a native JS loop

			/*  Clone the HTML template for a gallery item, change its id and
				show it. */
			var $newItem = $listItemTemplate
				.clone()
				.appendTo($list)
				.attr("id", "")
				.addClass("visible")

			/*  If supplying the 'etc' querystring, e.g. when
				navigating from Evothings Client, change http:// or https:// to
				evothings:// in the app URL so that the apps open in the
				Evothings Client app. */
			if (item.url && $.QueryString["etc"])
				item.url = item.url.replace(/https?:\/\//, 'evothings://')

			var itemURL = etc ? item.url : projectURLPrefix +
				item.title.replace(' ', '-')

			$newItem
				.children("a.screenshot")
					.attr("href", itemURL)
					.children("img")
						.attr("src", item.image)
						.attr("alt", item.title)
						.end()
					.end()
				.children("a.title")
					.attr("href", item.url)
					.text(item.title)
					.end()
				.children("p.description")
					.text(item.description)
					.end()
				.find(".author")
					.text(item.author)

			$.each(item.tags.split(','), function( index, value )
			{
				$newItem.children("p.tags").append(
					(index > 0 ? ', ' : '') + 
					'<a href="' + tagURLPrefix + value +
					(etc ? '&etc=1' : '') + '">#' + value + '</a>'
				)
			})

			if (item.links)
			{
				$firstItem = $('.resource', $newItem)
				$.each(item.links, function(resourceKey, resourceVal)
				{
					$firstItem.before(
						$resourceTemplate
							.clone()
							.addClass("resource-" + resourceKey)
							.attr("href", resourceVal)
							.text(resourceKey)
							.show()
					)
				})
				$firstItem.remove()
			}

			var shareURL = shareProjectURLBase +
				item.title.replace(' ', '-')

			$('.twitter-share-button').attr('data-url', shareURL )
			$('.fb-like').attr('data-href', shareURL )
			$('g-plus').attr('data-href', shareURL)
			//$('.linkedin-share').attr('data-url', shareURL )

		})

		gapi.plus.go()
		//IN.init()

	}).fail(function() {
		alert('Failed to load gallery.')
	})

})

/* jQuery plug-in that parses the URL Query String.
   Usage example: get the query string parameter named "param" through
   $.QueryString["param"] */
;(function($) {
	$.QueryString = (function(a)
	{
		if (a == "") return {}
		var b = {}
		for (var i = 0; i < a.length; ++i)
		{
			var p = a[i].split('=')
			if (p.length != 2) continue;
			b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "))
		}
		return b;
	})(window.location.search.substr(1).split('&'))
})(jQuery)

/* jQuery plug-in that produces the intersection between the two input arrays. */
;(function($) {
	$.arrayIntersect = function(a, b)
	{
		/* Make array values lowercase to perform case-insensitive intersection. */
		a = a.map(function (value) { console.log(value);return value.toLowerCase() })
		b = b.map(function (value) { console.log(value);return value.toLowerCase() })

		return $.grep(a, function(i)
		{
			return $.inArray(i, b) > -1
		})
	};
})(jQuery)
