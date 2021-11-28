document.addEventListener("DOMContentLoaded", () => {
	// Modals
	const penta = {
		modal: {
			open: false,
			type: "",
			elem: "",
			buttons: document.querySelectorAll("[data-modal]"),
			closeElems: document.querySelectorAll("[data-close-modal]"),
			overlay: document.querySelector(".penta-modal-overlay"),
			body: document.querySelector("body"),
			openModal({ type, brand, uid, dealership }) {
				console.log(`type:${type}\nbrand:${brand}\nuid:${uid}\ndealership:${dealership}`);
				this.open = true;
				this.body.classList.add("modal-open");
				this.type = type;
				this.elem = document.querySelector(`.penta-modal#${type}`);
				this.elem.classList.add("penta-show");
				this.overlay.classList.add("penta-show");
			},
			closeModal() {
				this.open = false;
				this.body.classList.remove("modal-open");
				this.type = "";
				this.elem.classList.remove("penta-show");
				this.overlay.classList.remove("penta-show");
				this.elem = "";
			},
			init() {
				if (this.buttons) {
					this.buttons.forEach((button) => {
						let data = {
							// Return defaults if not available
							type: (button.dataset.modal ??= "contact-us-modal"),
							brand: (button.dataset.brand ??= "Penta"),
							uid: (button.dataset.uid ??= "907b6bf5-da45-45a6-a326-05cb9908643e"),
							dealership: (button.dataset.dealership ??= "Penta Head Office")
						};
						button.addEventListener("click", () => {
							this.openModal(({ type, brand, uid, dealership } = data));
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
		forms: {
			api: "https://pinewood-api.dev.fireworkx.com/api/v1/leadsubmit",
			form: {},
			showFeedback(type) {
				const successElem = document.querySelector(".penta-form-success");
				const errorElem = document.querySelector(".penta-form-error");
				successElem.classList.remove("penta-show");
				errorElem.classList.remove("penta-show");
				if (type === "success") {
					successElem.classList.add("penta-show");
				}
				if (type === "error") {
					errorElem.classList.add("penta-show");
				}
				setTimeout(function () {
					successElem.classList.remove("penta-show");
					errorElem.classList.remove("penta-show");
				}, 5000);
			},
			init() {
				const forms = document.querySelectorAll(".penta-form");
				forms.forEach((elem) => {
					let form = new Form(elem);
				});
			}
		},
		init() {
			this.modal.init();
			this.accordions.init();
			this.forms.init();
		}
	};
	// Form constructor
	function Form(form) {
		this.sendForm = function () {
			let formData = new FormData(form);
			formData.append("Type", form.dataset.formType);
			formData.append("URL", window.location.href);
			formDataJson = JSON.stringify(Object.fromEntries(formData));
			fetch(penta.forms.api, {
				method: "POST",
				body: formDataJson,
				headers: {
					"Content-Type": "application/json"
				}
			})
				.then((response) => {
					if (response.status !== 200) {
						penta.forms.showFeedback("error");
					}
					if (response.status == 200) {
						this.resetForm(form);
						penta.forms.showFeedback("success");
						penta.modal.closeModal();
					}
				})
				.catch(() => {
					penta.forms.showFeedback("error");
				});
		};
		this.resetForm = function () {
			form.reset();
		};
		this.init = function () {
			const submitButton = form.querySelector(".penta-submit-button");
			submitButton.addEventListener("click", () => {
				if (form.checkValidity()) {
					this.sendForm();
				} else {
					form.reportValidity();
				}
			});
		};
		this.init();
	}
	penta.init();
});
