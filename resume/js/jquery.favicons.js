/***
@title:
Favicons

@version:
2.0

@author:
Andreas Lagerkvist

@date:
2008-09-16

@url:
http://andreaslagerkvist.com/jquery/favicons/

@license:
http://creativecommons.org/licenses/by/3.0/

@copyright:
2008 Andreas Lagerkvist (andreaslagerkvist.com)

@requires:
jquery

@does:
This little plug-in will insert favicons to all external links found on your site. The plug-in scans the URL the link is pointing to for a favicon and, if it can't find one, displays any generic favicon-image you like instead.

@howto:
jQuery(document.body).favicons({insert: 'prependTo'}); would prepend favicons to every external link in the document.

You wanna run the plug-in on a parent-element of the external links. Unless you want certain external links _not_ to have a favicon there's no reason not to run the plug-in on document.body.

@exampleHTML:
<ul>
	<li><a href="http://www.codinghorror.com/blog/">Coding Horror</a></li>
	<li><a href="http://remysharp.com">remy sharp's b:log</a></li>
	<li><a href="http://snook.ca/jonathan/">Snook.ca</a></li>
	<li><a href="http://www.danwebb.net">DanWebb.net</a></li>
	<li><a href="http://www.dustindiaz.com/">DustinDiaz.com</a></li>
</ul>

@exampleJS:
jQuery('#jquery-favicons-example').favicons({insert: 'insertBefore', defaultIco: WEBROOT +'aFramework/Styles/__common/gfx/jquery.favicons.png'});
***/
jQuery.fn.favicons = function (conf) {
	var config = jQuery.extend({
		insert:		'appendTo', 
		defaultIco: 'favicon.png'
	}, conf);

	return this.each(function () {
		jQuery('a[href^="http://"]', this).each(function () {
			var link		= jQuery(this);
			var faviconURL	= link.attr('href').replace(/^(http:\/\/[^\/]+).*$/, '$1') + '/favicon.ico';
			var faviconIMG	= jQuery('<img src="' + config.defaultIco + '" alt="" />')[config.insert](link);
			var extImg		= new Image();

			extImg.src = faviconURL;

			if (extImg.complete) {
				faviconIMG.attr('src', faviconURL);
			}
			else {
				extImg.onload = function () {
					faviconIMG.attr('src', faviconURL);
				};
			}
		});
	});
};