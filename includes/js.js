let storeInfo; // Declare variable to hold your fetched data
let shoppingCart = new Map();
const primaryURL = "https://fakestoreapi.com/products";
const backupURL =
  "https://deepblue.camosun.bc.ca/~c0180354/ics128/final/fakestoreapi.json";
const TAX_RATE = 0.12;
let orderInfo = {};

// let validationState = {
//   billing: false,
//   shipping: false,
//   payment: false,
// };

async function getData() {
  try {
    const response = await fetch(primaryURL);
    if (!response.ok) {
      throw new Error("Failed to fetch from primary URL");
    }
    const json = await response.json();
    console.log(json);
    return json;
  } catch (primaryError) {
    console.warn("Fetching from primary URL failed:", primaryError.message);

    try {
      const backupResponse = await fetch(backupURL);
      if (!backupResponse.ok) {
        throw new Error("Failed to fetch from backup URL");
      }
      const backupJson = await backupResponse.json();
      console.log(backupJson);
      return backupJson;
    } catch (backupError) {
      console.error("Error:", backupError);
      return null;
    }
  }
}
// Change
// dynamically load in e-commerce site data from API
getData()
  .then((data) => {
    data.forEach((element) => {
      loadCard(
        element["image"],
        element["title"],
        element["description"],
        element["price"]
      );
    });
    $("img")
      .addClass("w-50 m-3")
      .addClass("rounded mx-auto d-block")
      .addClass("ratio ratio-1x1 rounded ps-2");
    $(".card").addClass("m-3");
    $(".price").addClass("fs-2");
    let buttonElements = document.querySelectorAll(".btn-success");
    buttonElements.forEach((button, index) => {
      button.addEventListener("click", function () {
        let product = data[index];
        if (shoppingCart.has(product.id)) {
          // Assuming products have a unique "id". If not, use the title.
          let existingProduct = shoppingCart.get(product.id);
          existingProduct.quantity++;
        } else {
          product.quantity = 1;
          shoppingCart.set(product.id, product);
        }
        console.log("Button at index", index, "was clicked.");
        displayCart();
      });
    });
  })
  .catch((err) => {
    console.error("Error in processing:", err);
  });
// shows the offcanvas when called.
function showCanvas() {
  $("#offcanvasExample").addClass("show");
}
// hides the offcanvas when called.
function hideCanvas() {
  $("#shoppingCartCanvas").removeClass("show");
}

// this function is used to format the cards that are added by the getData() call.
function loadCard(src, title, content, price) {
  let elem = document.createElement("div");
  elem.className = "col";
  elem.innerHTML = `<div class="col">
        <div class="card">
            <img src="${src}" class="card-img-top" alt="...">
            <div class="card-body">
              <h5 class="card-title">${title}</h5>
              <p class="card-text">${content}</p>
              <div class="d-flex justify-content-between">
              <p class="price">$${price}</p>
              <button class="btn btn-success h-50" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    Add to Cart
                </button>
            </div>       
              </div>
        </div>
        </div>
        </div>`;
  document.getElementById("cardContainer").appendChild(elem);
}
// displays the cart when a new item is added. Also adds items to the cart, add functionality for adding/removing items, sums up totals, etc
function displayCart() {
  let total = 0;
  $("tbody").empty(); // Clear the tbody contents
  // iterate through the items in the cart and dynamically display them
  shoppingCart.forEach((item, key) => {
    let tableRow = document.createElement("tr");
    let title = document.createElement("td");
    let price = document.createElement("td");
    let quantityCell = document.createElement("td");
    let handle = document.createElement("td");

    tableRow.classList.add("align-middle");

    title.textContent = item["title"];
    price.textContent = `$${item["price"]}`;
    price.classList.add("text-center", "align-middle"); // align text center horizontally and vertically

    let buttonGroup = document.createElement("div");
    buttonGroup.classList.add(
      "d-flex",
      "flex-column",
      "align-items-center",
      "me-2"
    );

    let minusBtn = document.createElement("button");
    minusBtn.textContent = "-";
    minusBtn.classList.add(
      "btn",
      "btn-danger",
      "btn-sm",
      "p-1",
      "quantity-btn"
    );
    minusBtn.dataset.action = "decrease";
    minusBtn.dataset.productId = key;

    let quantityDisplay = document.createElement("span");
    quantityDisplay.textContent = item["quantity"];
    quantityDisplay.classList.add("mx-2"); // Add margin for some spacing between the buttons and the quantity

    let plusBtn = document.createElement("button");
    plusBtn.textContent = "+";
    plusBtn.classList.add(
      "btn",
      "btn-success",
      "btn-sm",
      "p-1",
      "quantity-btn"
    );
    plusBtn.dataset.action = "increase";
    plusBtn.dataset.productId = key;

    buttonGroup.appendChild(plusBtn);
    buttonGroup.appendChild(minusBtn);

    quantityCell.classList.add("d-flex", "align-items-center"); // Center align items
    quantityCell.appendChild(quantityDisplay);
    quantityCell.appendChild(buttonGroup);

    tableRow.appendChild(title);
    tableRow.appendChild(price);
    tableRow.appendChild(quantityCell);
    tableRow.appendChild(handle);

    $("tbody").append(tableRow);
    let itemTotal = item["price"] * item["quantity"];
    total += itemTotal;
  });

  let subtotal = total;
  let taxAmount = subtotal * TAX_RATE;
  let grandTotal = subtotal + taxAmount;

  orderInfo.subTotal = subtotal;
  orderInfo.Tax = taxAmount;
  orderInfo.grandTotal = grandTotal;

  document.getElementById("subTotal").textContent = `$${total.toFixed(2)}`;
  document.getElementById("totalTax").textContent = `$${taxAmount.toFixed(2)}`;
  document.getElementById("total").textContent = `$${grandTotal.toFixed(2)}`;
  document.getElementById("total").classList.add("text-decoration-underline");
  // show checkout button if cart is full
  if (total > 0) {
    document.getElementById("checkoutButton").disabled = false;
    document.getElementById("checkoutButton2").disabled = false;
    document.getElementById("clearCartButton").disabled = false;
  } else {
    document.getElementById("checkoutButton").disabled = true;
    document.getElementById("checkoutButton2").disabled = true;
    document.getElementById("clearCartButton").disabled = true;
  }

  $(".quantity-btn").on("click", function () {
    let productId = parseInt($(this).data("productId"));
    let action = $(this).data("action");

    if (action === "increase") {
      if (shoppingCart.has(productId)) {
        shoppingCart.get(productId).quantity++;
      }
    } else if (action === "decrease") {
      if (
        shoppingCart.has(productId) &&
        shoppingCart.get(productId).quantity > 1
      ) {
        shoppingCart.get(productId).quantity--;
      } else if (shoppingCart.get(productId).quantity === 1) {
        shoppingCart.delete(productId);
      }
    }

    displayCart(); // Refresh the cart display
  });
}
// clears the cart
$("#clearCartButton").on("click", function () {
  shoppingCart.clear(); // Clear the cart
  $("tbody").empty();
  displayCart(); // call display cart again
});

// A function the hides the offcanvas when the checkout modal is opened
$("#checkoutModal").on("show.bs.modal", function () {
  var offcanvasElement = document.getElementById("offcanvasExample");
  var bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
  if (bsOffcanvas) {
    bsOffcanvas.hide();
  }
});

// function that performs form validation and displays error messages when the checkout button is clicked.

document
  .querySelector("#detailsSubmit")
  .addEventListener("click", function (e) {
    e.preventDefault(); // prevent default action

    const isFormValid = validateDetails();

    // Reset previous error states
    const allInputs = document.querySelectorAll("#details .form-control");
    allInputs.forEach((input) => input.classList.remove("is-invalid"));

    const cardType = document.getElementById("cardtype").value;
    const cardNameElem = document.getElementById("cardName");
    const cardNumberElem = document.querySelector(
      "#details .control-group input"
    );
    const expirationDateElem = document.getElementById("expirationDate");
    const cvvElem = document.getElementById("cvv");

    const cardName = cardNameElem.value.trim();
    const cardNumber = cardNumberElem.value.trim();
    const expirationDate = expirationDateElem.value.trim();
    const cvv = cvvElem.value.trim();

    let validForm = true;

    // Name on Card Validation
    if (!cardName) {
      validForm = false;
      cardNameElem.classList.add("is-invalid");
    }

    // Card Number Validation and Check
    const Check = (num) => {
      let arr = (num + "")
        .split("")
        .reverse()
        .map((x) => parseInt(x));
      let lastDigit = arr.splice(0, 1)[0];
      let sum = arr.reduce(
        (acc, val, i) =>
          i % 2 !== 0 ? acc + val : acc + ((val *= 2) > 9 ? (val -= 9) : val),
        0
      );
      sum += lastDigit;
      return sum % 10 === 0;
    };

    switch (cardType) {
      case "visa":
        if (
          !/^4[0-9]{12}(?:[0-9]{3})?$/.test(cardNumber) ||
          !Check(cardNumber)
        ) {
          validForm = false;
          cardNumberElem.classList.add("is-invalid");
        }
        break;
      case "mastercard":
        if (!/^(?:5[1-5][0-9]{14})$/.test(cardNumber) || !Check(cardNumber)) {
          validForm = false;
          cardNumberElem.classList.add("is-invalid");
        }
        break;
      case "amex":
        if (!/^3[47][0-9]{13}$/.test(cardNumber) || !Check(cardNumber)) {
          validForm = false;
          cardNumberElem.classList.add("is-invalid");
        }
        break;
    }

    // Expiry Date Validation
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/.test(expirationDate)) {
      validForm = false;
      expirationDateElem.classList.add("is-invalid");
    }

    // CVV Validation
    switch (cardType) {
      case "visa":
      case "mastercard":
        if (!/^[0-9]{3}$/.test(cvv)) {
          validForm = false;
          cvvElem.classList.add("is-invalid");
        }
        break;
      case "amex":
        if (!/^[0-9]{4}$/.test(cvv)) {
          validForm = false;
          cvvElem.classList.add("is-invalid");
        }
        break;
    }
  });

document.addEventListener("DOMContentLoaded", function () {
  const paymentBtn = document.querySelector(
    "[data-bs-target='#billingDetails']"
  );
  const billingBtn = document.querySelector(
    "[data-bs-target='#shippingDetails']"
  );

  paymentBtn.addEventListener("click", function (e) {
    if (!validatePaymentDetails()) {
      e.preventDefault();
    }
  });

  billingBtn.addEventListener("click", function (e) {
    if (!validateBillingDetails()) {
      e.preventDefault();
    }
  });

  $("billingSubmit").on("click", function validateBillingDetails() {
    let billingName = document.getElementById("billingName").value;
    let billingAddress = document.getElementById("billingAddress").value;
    let billingCity = document.getElementById("billingCity").value;
    let billingPostalCode = document.getElementById("billingPostalCode").value;
    let billingCountry = document.getElementById("billingCountry").value;

    return (
      billingName !== "" &&
      billingAddress !== "" &&
      billingCity !== "" &&
      billingPostalCode !== "" &&
      billingCountry !== ""
    );
  });

  // You can add event listeners for additional tabs and validations as needed
});
function validateShippingDetails() {
  let shippingName = document.getElementById("shippingName").value;
  let shippingAddress = document.getElementById("shippingAddress").value;
  let shippingCity = document.getElementById("shippingCity").value;
  let shippingPostalCode = document.getElementById("shippingPostalCode").value;
  let shippingCountry = document.getElementById("shippingCountry").value;

  // rudimentary checks
  return (
    shippingName !== "" &&
    shippingAddress !== "" &&
    shippingCity !== "" &&
    shippingPostalCode !== "" &&
    shippingCountry !== ""
  );
}

$(document).ready(function () {
  $("#billingSubmit").on("click", function () {
    let isValid = validateBillingDetails();
    if (!isValid) {
      event.preventDefault();
    }
  });

  function validateBillingDetails() {
    let validForm = true;

    // Get all input values
    let billingName = document.getElementById("billingName").value.trim();
    let billingAddress = document.getElementById("billingAddress").value.trim();
    let billingCity = document.getElementById("billingCity").value.trim();
    let billingPostalCode = document
      .getElementById("billingPostalCode")
      .value.trim();
    let billingCountry = document.getElementById("billingCountry").value.trim();

    // Clear previous error states
    let allInputs = document.querySelectorAll("#billingDetails .form-control");
    allInputs.forEach((input) => input.classList.remove("is-invalid"));

    // Full Name validation
    if (billingName === "") {
      validForm = false;
      document.getElementById("billingName").classList.add("is-invalid");
    }

    // Address validation
    if (billingAddress === "") {
      validForm = false;
      document.getElementById("billingAddress").classList.add("is-invalid");
    }

    // City validation
    if (billingCity === "") {
      validForm = false;
      document.getElementById("billingCity").classList.add("is-invalid");
    }

    // Postal Code validation
    if (billingPostalCode === "") {
      validForm = false;
      document.getElementById("billingPostalCode").classList.add("is-invalid");
    } else {
      if (
        billingCountry === "Canada" &&
        !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(billingPostalCode)
      ) {
        // Add Canadian postal code validation
        validForm = false;
        document
          .getElementById("billingPostalCode")
          .classList.add("is-invalid");
      } else if (
        billingCountry === "United States" &&
        !/^\d{5}(-\d{4})?$/.test(billingPostalCode)
      ) {
        // Add US postal code validation
        validForm = false;
        document
          .getElementById("billingPostalCode")
          .classList.add("is-invalid");
      }
    }

    // Country validation
    if (billingCountry === "") {
      validForm = false;
      document.getElementById("billingCountry").classList.add("is-invalid");
    }

    return validForm;
  }
});

$(document).ready(function () {
  $("#shippingSubmit").on("click", function () {
    let isSameAsBilling = document.getElementById("btncheck1").checked;

    // If 'Same as billing' is checked, bypass validation and return true
    if (isSameAsBilling) {
      return true;
    }

    let isValid = validateShippingDetails();
    if (!isValid) {
      event.preventDefault();
    }
  });

  function validateShippingDetails() {
    let validForm = true;

    // Get all input values
    let shippingName = document.getElementById("shippingName").value.trim();
    let shippingAddress = document
      .getElementById("shippingAddress")
      .value.trim();
    let shippingCity = document.getElementById("shippingCity").value.trim();
    let shippingPostalCode = document
      .getElementById("shippingPostalCode")
      .value.trim();
    let shippingCountry = document
      .getElementById("shippingCountry")
      .value.trim();

    // Clear previous error and valid states
    let allInputs = document.querySelectorAll("#shippingDetails .form-control");
    allInputs.forEach((input) => {
      input.classList.remove("is-invalid");
      input.classList.remove("is-valid");
    });

    // Full Name validation
    if (shippingName === "") {
      validForm = false;
      document.getElementById("shippingName").classList.add("is-invalid");
    } else {
      document.getElementById("shippingName").classList.add("is-valid");
    }

    // Address validation
    if (shippingAddress === "") {
      validForm = false;
      document.getElementById("shippingAddress").classList.add("is-invalid");
    } else {
      document.getElementById("shippingAddress").classList.add("is-valid");
    }

    // City validation
    if (shippingCity === "") {
      validForm = false;
      document.getElementById("shippingCity").classList.add("is-invalid");
    } else {
      document.getElementById("shippingCity").classList.add("is-valid");
    }

    // Postal Code validation
    if (shippingPostalCode === "") {
      validForm = false;
      document.getElementById("shippingPostalCode").classList.add("is-invalid");
    } else {
      document.getElementById("shippingPostalCode").classList.add("is-valid");
    }
    if (billingPostalCode === "") {
      validForm = false;
      document.getElementById("billingPostalCode").classList.add("is-invalid");
    } else {
      if (
        billingCountry === "Canada" &&
        !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(billingPostalCode)
      ) {
        // Add Canadian postal code validation
        validForm = false;
        document
          .getElementById("shippingPostalCode")
          .classList.add("is-invalid");
      } else if (
        billingCountry === "United States" &&
        !/^\d{5}(-\d{4})?$/.test(billingPostalCode)
      ) {
        // Add US postal code validation
        validForm = false;
        document
          .getElementById("shippingPostalCode")
          .classList.add("is-invalid");
      }
    }

    // Country validation
    if (shippingCountry === "") {
      validForm = false;
      document.getElementById("shippingCountry").classList.add("is-invalid");
    } else {
      document.getElementById("shippingCountry").classList.add("is-valid");
    }

    return validForm;
  }
});

document.addEventListener("DOMContentLoaded", function () {
  setupCountryToAreaMapping("billingCountry", "billingArea");
  setupCountryToAreaMapping("shippingCountry", "shippingArea");

  function setupCountryToAreaMapping(countryId, areaId) {
    const countrySelect = document.getElementById(countryId);
    const areaSelect = document.getElementById(areaId);

    countrySelect.addEventListener("change", function () {
      // First, clear any existing options in the areaSelect
      areaSelect.innerHTML = "";

      // Now, populate based on the country
      if (countrySelect.value === "Canada") {
        const provinces = [
          "Alberta",
          "British Columbia",
          "Manitoba",
          "New Brunswick",
          "Newfoundland and Labrador",
          "Nova Scotia",
          "Ontario",
          "Prince Edward Island",
          "Quebec",
          "Saskatchewan",
          "Northwest Territories",
          "Nunavut",
          "Yukon",
        ];

        populateOptions(areaSelect, provinces);
      } else if (
        countrySelect.value === "US" ||
        countrySelect.value === "United States"
      ) {
        const states = [
          "Alabama",
          "Alaska",
          "Arizona",
          "Arkansas",
          "California",
          "Colorado",
          "Connecticut",
          "Delaware",
          "Florida",
          "Georgia",
          "Hawaii",
          "Idaho",
          "Illinois",
          "Indiana",
          "Iowa",
          "Kansas",
          "Kentucky",
          "Louisiana",
          "Maine",
          "Maryland",
          "Massachusetts",
          "Michigan",
          "Minnesota",
          "Mississippi",
          "Missouri",
          "Montana",
          "Nebraska",
          "Nevada",
          "New Hampshire",
          "New Jersey",
          "New Mexico",
          "New York",
          "North Carolina",
          "North Dakota",
          "Ohio",
          "Oklahoma",
          "Oregon",
          "Pennsylvania",
          "Rhode Island",
          "South Carolina",
          "South Dakota",
          "Tennessee",
          "Texas",
          "Utah",
          "Vermont",
          "Virginia",
          "Washington",
          "West Virginia",
          "Wisconsin",
          "Wyoming",
        ];

        populateOptions(areaSelect, states);
      }
    });
  }

  function populateOptions(selectElement, areas) {
    for (const area of areas) {
      const option = document.createElement("option");
      option.value = area;
      option.innerText = area;
      selectElement.appendChild(option);
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const currencySelect = document.getElementById("currency");
  const confirmationDiv = document.getElementById("ConfirmationDiv");

  currencySelect.addEventListener("change", function () {
    // Fetch currency rates when currency selection changes
    fetch(
      `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/cad.json`
    )
      .then((response) => response.json())
      .then((data) => {
        const selectedCurrency = currencySelect.value;
        const conversionRate = data["cad"][`${selectedCurrency.toLowerCase()}`];
        console.log(selectedCurrency);
        console.log(conversionRate);

        // Clear any existing data
        confirmationDiv.innerHTML = "";

        for (const key in orderInfo) {
          // Convert the string values to numbers and multiply by conversion rate
          const convertedAmount = (
            parseFloat(orderInfo[key]) * conversionRate
          ).toFixed(2);
          const p = document.createElement("p");
          p.textContent = `${capitalizeFirstLetter(
            key.replace(/([A-Z])/g, " $1")
          )}:  $: ${convertedAmount} ${selectedCurrency}`;
          confirmationDiv.appendChild(p);
        }
      })
      .catch((error) => {
        console.error("Error fetching currency rates:", error);
      });
  });

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  let confirmationButton = document.getElementById("confirmation-submit");
  let validationState = {
    billing: validateBillingDetails(),
    shipping: validateShippingDetails(),
    payment: true,
  };
  confirmationButton.addEventListener("click", function () {
    // Check if all tabs are validated
    let allValid = Object.values(validationState).every(
      (status) => status === true
    );

    if (!allValid) {
      alert(
        "Please ensure all details are correctly filled before submitting!"
      );
      return;
    }

    let orderData = {};

    fetch("https://deepblue.camosun.ca/~c0180354/ics128/final-project/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Handle the response here. Let's assume a successful submission returns { success: true }
        if (data.success) {
          alert("Order submitted successfully!");
          emptyCart();
        } else {
          alert(`Error: ${data.message}`); // Assuming the error response has a 'message' key.
        }
      })
      .catch((error) => {
        alert("There was a problem with the submission: " + error.message);
      });
  });
});

function emptyCart() {
  // Here, implement the logic to empty the cart
}
