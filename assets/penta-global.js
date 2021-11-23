document.addEventListener("DOMContentLoaded", () => {
	// Modals
	const modal = {
		open: false,
		type: "",
		elem: "",
		buttons: document.querySelectorAll("a[data-modal]"),
		closeElems: document.querySelectorAll('[data-modal="close-modal"]'),
		overlay: document.querySelector(".penta-modal-overlay"),
		openModal(type) {
			modal.open = true;
			modal.type = type;
			modal.elem = document.querySelector(`.penta-modal#${type}`);
			modal.elem.classList.add("penta-show");
			modal.overlay.classList.add("penta-show");
		},
		closeModal() {
			modal.open = false;
			modal.type = "";
			modal.elem.classList.remove("penta-show");
			modal.overlay.classList.remove("penta-show");
			modal.elem = "";
		}
	};
	if (modal.buttons) {
		modal.buttons.forEach((button) => {
			button.addEventListener("click", () => {
				modal.openModal(button.dataset.modal);
			});
		});
	}
	if (modal.closeElems) {
		modal.closeElems.forEach((elem) => {
			elem.addEventListener("click", () => {
				modal.closeModal();
			});
		});
	}
});
