document.addEventListener("DOMContentLoaded", () => {
	var productThumbsSwiper = new Swiper("#penta-product-thumbs-swiper", {
		spaceBetween: 10,
		slidesPerView: 2,
		breakpoints: {
			320: {
				slidesPerView: 3,
				spaceBetween: 8
			},
			375: {
				slidesPerView: 4,
				spaceBetween: 8
			},
			768: {
				slidesPerView: 4,
				spaceBetween: 16
			}
		},
		freeMode: true,
		watchSlidesVisibility: true,
		watchSlidesProgress: true
	});
	var productSwiper = new Swiper("#penta-product-swiper", {
		spaceBetween: 10,
		navigation: {
			nextEl: ".swiper-button-next",
			prevEl: ".swiper-button-prev"
		},
		thumbs: {
			swiper: productThumbsSwiper
		},
		pagination: {
			el: ".swiper-pagination",
			clickable: true
		}
	});
});
