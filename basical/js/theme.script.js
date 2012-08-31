jQuery(document).ready(function($){	
	/////////////////////////////////////////////
	// Scroll to top 							
	/////////////////////////////////////////////
	$('.back-top a').click(function () {
		$('body,html').animate({
			scrollTop: 0
		}, 800);
		return false;
	});

	/////////////////////////////////////////////
	// Toggle menu on mobile 							
	/////////////////////////////////////////////
	$('#main-nav-wrap').prepend('<div id="menu-icon" class="mobile-button"></div>');
	
	$("#menu-icon").click(function(){
		$("#header #main-nav").fadeToggle();
		$("#header #searchform").hide();
		$(this).toggleClass("active");
	});

	/////////////////////////////////////////////
	// Toggle searchform on mobile 							
	/////////////////////////////////////////////
	$('#searchform-wrap').prepend('<div id="search-icon" class="mobile-button"></div>');

	$("#search-icon").click(function(){
		$("#header #searchform").fadeToggle();
		$("#header #main-nav").hide();
		$(this).toggleClass("active");
	});

});