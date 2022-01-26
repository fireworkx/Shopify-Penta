document.addEventListener("DOMContentLoaded", () => {
	// Modals
	const penta = {
		modal: {
			open: false,
			type: "",
			form: {
				elem: "",
				type: "",
				brand: "",
				uid: "",
				dealership: "",
				select: ""
			},
			gallery: {
				index: 0
			},
			buttons: document.querySelectorAll("[data-modal]"),
			closeElems: document.querySelectorAll("[data-close-modal]"),
			overlay: document.querySelector(".penta-modal-overlay"),
			body: document.querySelector("body"),
			openModal({ type, brand, uid, dealership }, e) {
				return new Promise((resolve, reject) => {
					this.open = true;
					this.body.classList.add("modal-open");
					this.overlay.classList.add("penta-show");
					if (type == "gallery-modal") {
						this.type = "gallery-modal";
					}
					{
						this.type = type;
						this.form = {
							elem: document.querySelector(`.penta-modal#${type}`),
							type: type,
							brand: brand,
							uid: uid,
							dealership: dealership,
							select: document.querySelector(`.penta-modal#${type} select[name="Branch"]`)
						};
						this.form.elem.classList.add("penta-show");
						return resolve(({ elem, select, brand, dealership, uid } = this.form));
					}
				});
			},
			closeModal() {
				this.open = false;
				this.body.classList.remove("modal-open");
				this.overlay.classList.remove("penta-show");
				if (type == "gallery-modal") {
				}
				{
					this.form.elem.classList.remove("penta-show");
					this.form = {
						elem: "",
						type: "",
						brand: "",
						uid: "",
						dealership: "",
						select: ""
					};
				}
			},
			init() {
				if (this.buttons) {
					this.buttons.forEach((button) => {
						let data = {
							// Return defaults if not available
							type: button.dataset.modal,
							brand: button.dataset.brand,
							uid: button.dataset.uid,
							dealership: button.dataset.dealership
						};
						button.addEventListener("click", () => {
							this.openModal(({ type, brand, uid, dealership } = data)).then(() => {
								if (!uid && type != "gallery-modal") {
									penta.forms.buildSelect(elem, select, brand, dealership, uid);
								}
							});
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
		forms: {
			api: "https://pinewood-api.dev.fireworkx.com/api/v1/leadsubmit",
			form: {},
			buildSelect(elem, select, brand, dealership, uid) {
				// Builds select option list
				let dealerships = [];
				window.penta
					.getDealerships()
					.then((data) => {
						// Build dropdown list filtered by brand data attribute
						dealerships = data.dealerships.filter(
							(dealership) => dealership.brand.toLowerCase() == brand.toLowerCase()
						);
						let options = dealerships.map((dealership) => {
							return `<option>${dealership.name}</option>`;
						});
						select.innerHTML = options;
					})
					.then(() => {
						// If dealership available set as selected value and set form uid
						if (dealership) {
							select.value = dealership;
							penta.modal.form.uid = dealership.id;
						}
						// else set to first option
						if (!dealership) {
							select.value = dealerships[0].name;
							penta.modal.form.uid = dealerships[0].id;
						}
						// listen for changes to select and update uid accordingly
						select.addEventListener("change", () => {
							dealership = dealerships.find(
								(dealership) => dealership.name.toLowerCase() == select.value.toLowerCase()
							);
							penta.modal.form.uid = dealership.id;
						});
					});
			},
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
			this.forms.init();
		}
	};
	// Form constructor
	function Form(form) {
		const submitButton = form.querySelector(".penta-submit-button");
		this.sendForm = function ({ uid }) {

			let formData = new FormData(form),
			 	Make = formData.has('Make'),
				Model = formData.has('Model');
			// Form specific payloads
			switch (form.id) {
				case "test-drive-form":
					formData.set(
						"Message",
						[
							`Message: ${formData.get("Message")}\n`,
							`Preferred Date: ${formData.get("PreferredDate")}\n`,
							`Preferred Time: ${formData.get("PreferredTime")}\n`
						].join("")
					);
					formData.delete("PreferredDate");
					formData.delete("PreferredTime");
					break;
				case "enquiry-form":
					formData.set("Message", [
						`Message: ${formData.get("Message")}\n`
						`${Make && formData.get('Make')} ${Model && formData.get('Model')}`
					])
				default:
			}
			formData.append("Type", form.dataset.formType);
			formData.append("URL", window.location.href);
			formData.set("StockListApiId", uid);
			formData.delete("Branch");
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
					submitButton.disabled = false;
				})
				.catch(() => {
					penta.forms.showFeedback("error");
				});
		};
		this.resetForm = function () {
			form.reset();
		};
		this.init = function () {
			submitButton.addEventListener("click", () => {
				window.dataLayer.push({ event_name: "enquiry_submit" });
				if (form.checkValidity()) {
					submitButton.disabled = true;
					this.sendForm(({ uid } = penta.modal.form));
				} else {
					form.reportValidity();
				}
			});
		};
		this.init();
	}
	penta.init();
});
