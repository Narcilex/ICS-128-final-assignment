let storeInfo; // Declare variable to hold your fetched data
let shoppingCart = new Map();
const primaryURL = "https://fakestoreapi.com/products";
const backupURL =
  "https://deepblue.camosun.bc.ca/~c0180354/ics128/final/fakestoreapi.json";
const TAX_RATE = 0.12;

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

function checkout() {
  const cardName = document.getElementById("cardName").value;
  const cardNumber = document.getElementById("cardNumber").value;
  const expirationDate = document.getElementById("expirationDate").value;
  const cvv = document.getElementById("cvv").value;
}

document
  .querySelector("#details button")
  .addEventListener("click", function (e) {
    e.preventDefault(); // prevent default action

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

    // Card Number Validation and Luhn Check
    const luhnCheck = (num) => {
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
          !luhnCheck(cardNumber)
        ) {
          validForm = false;
          cardNumberElem.classList.add("is-invalid");
        }
        break;
      case "mastercard":
        if (
          !/^(?:5[1-5][0-9]{14})$/.test(cardNumber) ||
          !luhnCheck(cardNumber)
        ) {
          validForm = false;
          cardNumberElem.classList.add("is-invalid");
        }
        break;
      case "amex":
        if (!/^3[47][0-9]{13}$/.test(cardNumber) || !luhnCheck(cardNumber)) {
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

    // If all validations pass, move to the next tab
    if (validForm) {
      let event = new Event("click");
      document.querySelector("#billingDetails").dispatchEvent(event);
    }
  });
