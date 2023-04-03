;(function () {

	'use strict';

	var contentWayPoint = function() {
		var i = 0;
		$('.animate-box').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('animated-fast') ) {

				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function(){

					$('body .animate-box.item-animate').each(function(k){
						var el = $(this);
						setTimeout( function () {
							var effect = el.data('animate-effect');
							if ( effect === 'fadeIn') {
								el.addClass('fadeIn animated-fast');
							} else if ( effect === 'fadeInLeft') {
								el.addClass('fadeInLeft animated-fast');
							} else if ( effect === 'fadeInRight') {
								el.addClass('fadeInRight animated-fast');
							} else {
								el.addClass('fadeInUp animated-fast');
							}

							el.removeClass('item-animate');
						},  k * 100, 'easeInOutExpo' );
					});

				}, 50);

			}

		} , { offset: '85%' } );
	};



	var goToTop = function() {

		$('.js-gotop').on('click', function(event){

			event.preventDefault();

			scollWithAnimation('html');

			return false;
		});

		$(window).scroll(function(){

			var $win = $(window);
			if ($win.scrollTop() > 200) {
				$('.js-top').addClass('active');
			} else {
				$('.js-top').removeClass('active');
			}

		});

	};

	var goToSections = function() {
		$('#nav-button-home').on('click', function(event){
			event.preventDefault();
			scollWithAnimation('html');
			return false;
		});
		$('#nav-button-about').on('click', function(event){
			event.preventDefault();
			scollWithAnimation('#about');
			return false;
		});
		$('#nav-button-skills').on('click', function(event){
			event.preventDefault();
			scollWithAnimation('#skills');
			return false;
		});
		$('#nav-button-experience').on('click', function(event){
			event.preventDefault();
			scollWithAnimation('#experience');
			return false;
		});
		$('#nav-button-projects').on('click', function(event){
			event.preventDefault();
			scollWithAnimation('#projects');
			return false;
		});
		$('#nav-button-resume').on('click', function(event){
			event.preventDefault();
			scollWithAnimation('#resume');
			return false;
		});
		$('#scroll-indicator').on('click', function(event){
			event.preventDefault();
			scollWithAnimation('#about');
			return false;
		});

	};



	var scollWithAnimation = function(targetSelector, duration, effect, callback) {
			duration = duration || 500;
			effect = effect || 'easeInOutExpo';
			var keyframes = {
				scrollTop: $(targetSelector).offset().top
			};
			$('html, body').animate(keyframes, duration, effect, callback);
	};

	var skillsWayPoint = function() {
		if ($('#fh5co-skills').length > 0 ) {
			$('#fh5co-skills').waypoint( function( direction ) {

				if( direction === 'down' && !$(this.element).hasClass('animated') ) {
					setTimeout( pieChart , 400);
					$(this.element).addClass('animated');
				}
			} , { offset: '90%' } );
		}

	};

	var showNavigationBar = function () {
		var navigationBar = document.getElementById('navigation-bar');
		var scrollIndicator = document.getElementById('scroll-indicator');
		$(window).scroll(function(){
			var $win = $(window);
			if ($win.scrollTop() > 200) {
				navigationBar.classList.add('active');
				scrollIndicator.classList.add('hide');
			} else {
				navigationBar.classList.remove('active');
				scrollIndicator.classList.remove('hide');
			}
		});
	};

	var changeActiveSectionOnScroll = function () {
		$(window).scroll(function(){
			updateActiveSection();
		});
	};

	var updateActiveSection = function() {
		var currentActiveListItemId = "nav-li-";
		var a = "";
		sections.forEach((section) => {
			const sectionTop = section.offsetTop;
			if (pageYOffset >= sectionTop - 200) {
				a = section.getAttribute("id");
			}
		});
		currentActiveListItemId += a;
		navigationBarListItems.forEach(function (listItem) {
			listItem.classList.remove("active-item");
			if (listItem.id === currentActiveListItemId) {
				listItem.classList.add("active-item");
			}
		});
	}


	// Loading page
	var loaderPage = function() {
		$("#page-loader").fadeOut("slow");
	};

	var flipProfilePhoto = function() {
		var flidCardContainer = document.getElementById('flip-card-container');
		flidCardContainer.onclick = function () {
			flidCardContainer.classList.toggle('flip');
		}
	};

	var stickToResumeCanvas = function() {
		var position = $(window).scrollTop();
		var stickAnimationStarted = false;
		$(window).scroll(function(event) {
			var scroll = $(window).scrollTop();
			var isDirectionDown =  scroll > position;
			position = scroll;
			if (isDirectionDown && !stickAnimationStarted) {
				var resumeCanvas = document.getElementById('resume');
				var canvasBoundingBox = resumeCanvas.getBoundingClientRect();
				if (canvasBoundingBox.top > canvasBoundingBox.height / 2 && canvasBoundingBox.top < canvasBoundingBox.height / 1.75) {
					stickAnimationStarted = true;
					scollWithAnimation('#resume', 500, undefined, function () {
						stickAnimationStarted = false;
						updateActiveSection();
					});
				}
			}
		});
	};

	var navigationBarListItems = document.querySelectorAll("#navbar-list li");
	var sectionIdList = ['home', 'about', 'skills', 'experience', 'projects', 'resume'];
	var sections = [];
	sectionIdList.forEach(function (sectionId) {
		var sectionElement = document.getElementById(sectionId);
		if (sectionElement) {
			sections.push(sectionElement);
		}
	});


	$(function(){
		contentWayPoint();
		goToTop();
		showNavigationBar();
		changeActiveSectionOnScroll();
		goToSections();
		loaderPage();
		stickToResumeCanvas();
		flipProfilePhoto();
		skillsWayPoint();
	});


}());
