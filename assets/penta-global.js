document.addEventListener("DOMContentLoaded", () => {
	// Modals
	const penta = {
		modal: {
			open: false,
			type: "",
			elem: "",
			buttons: document.querySelectorAll("a[data-modal]"),
			closeElems: document.querySelectorAll('[data-modal="close-modal"]'),
			overlay: document.querySelector(".penta-modal-overlay"),
			openModal(type) {
				this.open = true;
				this.type = type;
				this.elem = document.querySelector(`.penta-modal#${type}`);
				this.elem.classList.add("penta-show");
				this.overlay.classList.add("penta-show");
			},
			closeModal() {
				this.open = false;
				this.type = "";
				this.elem.classList.remove("penta-show");
				this.overlay.classList.remove("penta-show");
				this.elem = "";
			},
			init() {
				if (this.buttons) {
					this.buttons.forEach((button) => {
						button.addEventListener("click", () => {
							this.openModal(button.dataset.modal);
						});
					});
				}
				if (this.closeElems) {
					this.closeElems.forEach((elem) => {
						elem.addEventListener("click", () => {
							this.closeModal();
						});
					});
				}
			}
		},
		accordions: {
			buttons: document.querySelectorAll(".penta-accordion"),
			init() {
				if (this.buttons) {
					this.buttons.forEach((button) => {
						button.addEventListener("click", () => {
							if (button.nextElementSibling.classList.contains("penta-accordion-content"))
								button.nextElementSibling.classList.toggle("penta-show");
						});
					});
				}
			}
		},
		init() {
			this.modal.init();
			this.accordions.init();
		}
	};
	penta.init();
});
