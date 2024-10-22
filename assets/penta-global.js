document.addEventListener("DOMContentLoaded", () => {
  // Get deal from hero

  let brandDeal = document.querySelector("[data-brand]");
  if (brandDeal) {
    brandDeal = brandDeal.dataset.brand;
  }

  // Modals
  const penta = {
    modal: {
      open: false,
      type: "",
      deals: {
        title: "",
        price: "",
        period: "",
      },
      modelVariant: "",
      form: {
        elem: "",
        type: "",
        brand: "",
        uid: "",
        dealership: "",
        select: "",
      },
      gallery: {
        index: 0,
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
              select: document.querySelector(
                `.penta-modal#${type} select[name="Branch"]`
              ),
            };
            this.form.elem.classList.add("penta-show");
            if (this.form.type == "calculator-modal") {
              calculatorModalOpen();
            }
            return resolve(
              ({ elem, select, brand, dealership, uid } = this.form)
            );
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
            select: "",
          };
        }
      },
      init() {
        penta.modal.buttons = document.querySelectorAll("[data-modal]");
        if (this.buttons) {
          this.buttons.forEach((button) => {
            let data = {
              // Return defaults if not available
              type: button.dataset.modal,
              brand: button.dataset.brand,
              uid: button.dataset.uid,
              dealership: button.dataset.dealership,
            };
            button.addEventListener("click", () => {
              this.openModal(({ type, brand, uid, dealership } = data)).then(
                () => {
                  if (!uid && type != "gallery-modal") {
                    penta.forms.buildSelect(
                      elem,
                      select,
                      brand,
                      dealership,
                      uid
                    );
                  }
                }
              );
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
      },
    },
    forms: {
      api: "https://pinewood-api.live.fireworkx.com/api/v1/leadsubmit",
      form: {},
      buildSelect(elem, select, brand, dealership, uid) {
        // Builds select option list
        let dealerships = [];
        window.penta
          .getDealerships()
          .then((data) => {
            // Build dropdown list filtered by brand data attribute
            dealerships = data.dealerships.filter(
              (dealership) =>
                dealership.brand.toLowerCase() == brand.toLowerCase()
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
                (dealership) =>
                  dealership.name.toLowerCase() == select.value.toLowerCase()
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
      },
    },
    init() {
      this.modal.init();
      this.forms.init();
    },
  };
  // Form constructor
  function Form(form) {
    const submitButton = form.querySelector(".penta-submit-button");
    this.sendForm = function ({ uid }) {
      let formData = new FormData(form),
        Make = formData.has("Make") ? formData.get("Make") : "",
        Model = formData.has("Model") ? formData.get("Model") : "";
      // Form specific payloads
      switch (form.id) {
        case "test-drive-form":
          formData.set(
            "Message",
            [
              `Message: ${formData.get("Message")}\n`,
              `Preferred Date: ${formData.get("PreferredDate")}\n`,
              `Preferred Time: ${formData.get("PreferredTime")}\n`,
            ].join("")
          );
          formData.delete("PreferredDate");
          formData.delete("PreferredTime");
          break;
        case "enquiry-form":
          formData.set(
            "Message",
            [`Message: ${formData.get("Message")}\n`, `${Make} ${Model}`].join(
              ""
            )
          );
        case "deal-enquiry-form":
          formData.set(
            "Message",
            [
              `Message: ${formData.get("Message")}\n`,
              `Variant: ${penta.modal.deals.title}\n`,
              `Price: ${penta.modal.deals.price}\n`,
              `Period: ${penta.modal.deals.period}\n`,
            ].join("")
          );
        default:
      }
      formData.append(
        "Model Variant and Specification",
        penta.modal.modelVariant
      );
      formData.append("Type", form.dataset.formType);
      formData.append("URL", window.location.href);
      formData.set("StockListApiId", uid);
      formData.delete("Branch");
      formDataJson = JSON.stringify(Object.fromEntries(formData));
      fetch(penta.forms.api, {
        method: "POST",
        body: formDataJson,
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.status !== 200) {
            penta.forms.showFeedback("error");
          }
          if (response.status == 200) {
            // window.dataLayer = window.dataLayer || [];

            // function gtag() {
            //   dataLayer.push(arguments);
            // }

            // gtag({ event: "enquiry_submit" });
            // window.dataLayer.push({ event_name: "enquiry_submit" });

            // window.dataLayer.push({ event: "enquiry_submit" });
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
      submitButton?.addEventListener("click", () => {
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

  // Get this deal

  const dealBtns = document.querySelectorAll(
    "[data-modal='deal-enquiry-modal']"
  );

  if (dealBtns) {
    dealBtns.forEach((dealBtn) => {
      dealBtn.setAttribute("data-brand", brandDeal);
      dealBtn.addEventListener("click", () => {
        let card = dealBtn.closest(".card-info");
        let imageSrc = card.querySelector("img").src;
        penta.modal.deals.title = card.querySelector(".deal-title").textContent;
        penta.modal.deals.price = card.querySelector(".deal-price").textContent;
        penta.modal.deals.period =
          card.querySelector(".deal-period").textContent;
        penta.modal.deals.deposit =
          card.querySelector(".deal-deposit").textContent;
        penta.modal.deals.interestType = card.querySelector(
          ".deal-interest-type"
        ).textContent;
        penta.modal.deals.balloon =
          card.querySelector(".deal-balloon").textContent;
        penta.modal.deals.retailCost =
          card.querySelector(".deal-retail-cost").textContent;
        penta.modal.deals.creditCost =
          card.querySelector(".deal-credit-cost").textContent;

        // Populate the form header snippet
        const dealContext = document.querySelector(
          "#penta-deal-form-context-block"
        );
        dealContext.querySelector("#deal-context-image").src = imageSrc;
        dealContext.querySelector("#deal-context-title").textContent =
          penta.modal.deals.title;
        dealContext.querySelector("#deal-context-price").textContent =
          penta.modal.deals.price;
        dealContext.querySelector("#deal-context-period").textContent =
          penta.modal.deals.period;
        dealContext.querySelector("#deal-context-deposit").textContent =
          penta.modal.deals.deposit;
        dealContext.querySelector("#deal-context-interest-type").textContent =
          penta.modal.deals.interestType;
      });
    });
  }

  //Test Drive
  const table = document.querySelector(".specification-table table");
  if (table) {
    const tableBody = document
      .getElementsByTagName("table")[0]
      .getElementsByTagName("tbody")[0];

    let columnCount = table.rows[0].cells.length;
    let newRow = tableBody.insertRow();

    // insert new cells
    for (let index = 0; index <= columnCount - 1; index++) {
      var newCell = newRow.insertCell();
      const button = document.createElement("button");
      button.innerHTML = "Book a Test Drive";
      button.setAttribute("data-modal", "deal-test-drive-modal");
      button.setAttribute("data-brand", brandDeal);
      button.classList.add("test-drive-button");
      button.addEventListener("click", () => {
        const variant = table.rows[0].cells[index].textContent;

        const testContext = document.querySelector(
          "#penta-deal-book-test-form-context-block"
        );

        testContext.querySelector(
          "#book-test-deal-context-title"
        ).textContent = `${brandDeal} ${variant}`;
        penta.modal.modelVariant = `${brandDeal} ${variant}`;
      });

      if (index > 0) {
        newCell.append(button);
      }
    }

    // Add Icon in table

    const checkIcon = document.querySelector(".check-circle-icon");
    const optionIcon = document.querySelector(".option-circle-icon");
    const minusIcon = document.querySelector(".minus-icon");

    const rows = table.rows;
    if (!rows) {
      return;
    }
    Array.from(rows).forEach((row) => {
      const cells = Array.from(row.cells);
      cells.forEach((cell) => {
        const content = cell.textContent;
        if (content === "Standard") {
          cell.textContent = "";
          const clonedIcon = checkIcon.cloneNode();
          cell.append(clonedIcon);
        }
        if (content === "Optional") {
          cell.textContent = "";
          const clonedIcon = optionIcon.cloneNode();
          cell.append(clonedIcon);
        }
        if (content === "Not available") {
          cell.textContent = "";
          const clonedIcon = minusIcon.cloneNode();
          cell.append(clonedIcon);
        }
      });
    });
  }

  //   Load price per month on product card on collection page
  let prices = document.querySelectorAll(".penta-card-loan");

  prices.forEach((pricePerMonth) => {
    if (pricePerMonth) {
      const initialAmount = Number(pricePerMonth.dataset.price) / 100;
      const initialTenPerCent = initialAmount * 0.1;
      const initialLoanTermsPerMonths = 72;
      const initialInterest = 13;
      const calc = calculateMonthlyPayment(
        initialAmount,
        initialLoanTermsPerMonths,
        initialInterest,
        initialTenPerCent
      );
      const parsedCalc = Number(calc);
      const formattedPrice = parsedCalc.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' });
      pricePerMonth.innerHTML = `${formattedPrice.replaceAll(",", " ")} / month`;
    }
  });

  function calculateMonthlyPayment(
    loanAmount,
    loanTermMonths,
    annualInterestRate,
    depositValue
  ) {
    // Default values if not provided by the user
    loanTermMonths = isNaN(loanTermMonths) ? 72 : parseInt(loanTermMonths);
    annualInterestRate = isNaN(annualInterestRate)
      ? 13
      : parseFloat(annualInterestRate);
    depositValue = isNaN(depositValue)
      ? loanAmount * 0.1
      : parseFloat(depositValue);

    // Calculate loan amount after deducting deposit
    var principal = loanAmount - depositValue;

    // Convert annual interest rate to monthly rate
    var monthlyInterestRate = annualInterestRate / 12 / 100;

    // Calculate monthly payment using the formula
    var monthlyPayment =
      (principal * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -loanTermMonths));

    // Return the result
    return Number(monthlyPayment.toFixed(2));
  }

  // load prices on recomended products card on product detail page
  const productRecommendations = document.querySelector(
    ".product-recommendations"
  );

  function waitForRecommendedProducts(className) {
    return new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            const addedNodes = Array.from(mutation.addedNodes);
            addedNodes.forEach((node) => {
              if (node.classList && node.classList.contains(className)) {
                observer.disconnect();
                resolve(node);
              }
            });
          }
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  if (productRecommendations) {
    waitForRecommendedProducts("product-grid").then((div) => {
      //   Load price per month on product card on collection page
      let prices = document.querySelectorAll(".penta-card-loan");

      prices.forEach((pricePerMonth) => {
        if (pricePerMonth) {
          const initialAmount = Number(pricePerMonth.dataset.price) / 100;
          const initialTenPerCent = initialAmount * 0.1;
          const initialLoanTermsPerMonths = 72;
          const initialInterest = 13;
          const calc = calculateMonthlyPayment(
            initialAmount,
            initialLoanTermsPerMonths,
            initialInterest,
            initialTenPerCent
          );
          const parsedCalc = Number(calc);
          const formattedPrice = parsedCalc.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' });
          pricePerMonth.innerHTML = `${formattedPrice.replaceAll(",", " ")} / month`;
        }
      });
    });
  }

  // open calculator modal
  function calculatorModalOpen() {
    const form = document.getElementById("calculator-form");
    if (form) {
      const amountInput = document.getElementById("amount");
      const monthsInput = document.getElementById("months");
      const interestInput = document.getElementById("interest");
      const downInput = document.getElementById("down");
      const downLabel = document.getElementById("down-payment-label");
      const output = document.getElementById("output");

      const calculatorButton = document.querySelector(
        "#calculator-modal-button"
      );

      downLabel.innerHTML = "Down Payment (10%)";

      const initialAmount = Number(calculatorButton.dataset.price) / 100;
      const initialTenPerCent = initialAmount * 0.1;
      const initialLoanTermsPerMonths = 72;
      const initialInterest = 13;

      amountInput.value = initialAmount;
      downInput.value = initialTenPerCent;

      output.innerHTML = `Monthly Payment: <span class="monthly-price">R ${calculateMonthlyPayment(
        initialAmount,
        initialLoanTermsPerMonths,
        initialInterest,
        initialTenPerCent
      )}<span>`;

      downInput.addEventListener("change", function () {
        const percentValue = (
          (Number(downInput.value) / Number(amountInput.value)) *
          100
        ).toFixed(0);
        downLabel.innerHTML = `Down Payment - (${percentValue}%)`;
      });

      const calculateBtn = document.querySelector("#calculate-button");
      calculateBtn.addEventListener("click", function () {
        const amount = document.getElementById("amount-error-message");
        const month = document.getElementById("month-error-message");
        const interest = document.getElementById("interest-error-message");

        // Utility function to toggle visibility based on input value
        function toggleVisibility(inputElement, targetElement) {
          if (!inputElement.value) {
            targetElement.classList.remove("hidden");
            targetElement.classList.add("block");
          } else {
            targetElement.classList.remove("block");
            targetElement.classList.add("hidden");
          }
        }

        // Attach event listeners and apply initial visibility state
        const inputs = [
          {
            input: amountInput,
            target: amount,
          },
          {
            input: monthsInput,
            target: month,
          },
          {
            input: interestInput,
            target: interest,
          },
        ];

        inputs.forEach(({ input, target }) => {
          input.addEventListener("change", () =>
            toggleVisibility(input, target)
          );

          toggleVisibility(input, target);
        });

        const calculation = calculateMonthlyPayment(
          amountInput.value,
          monthsInput.value,
          interestInput.value,
          downInput.value
        );

        const parsedCalc = Number(calculation);
        const formattedPrice = parsedCalc.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' });
        output.innerHTML = formattedPrice
          ? `Monthly Payment: <span class="monthly-price">R ${formattedPrice}</span>`
          : null;
      });

      monthsInput.addEventListener("keyup", function () {
        setTimeout(() => {
          const months = parseInt(monthsInput.value) || 0;
        }, 500);
      });
    }
  }
  penta.init();
});
