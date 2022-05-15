// Importo las constantes.

import {
  cartContainer,
  cartList,
  cartCountInfo,
  cartTotalValue,
  productList,
  confirmPurchaseBtn,
} from "./scripts/constants.js";

// Declaro el ItemID

let cartItemID = 1;

// Updatear / recargar la informacion del carrito

function updateCartInfo() {
  let cartInfo = findCartInfo();
  cartCountInfo.textContent = cartInfo.productCount;
  cartTotalValue.textContent = cartInfo.total;
}

// Fetch de la data del JSON, simulando una API

const fetchData = () => {
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      let html = "";
      data.forEach((product) => {
        html += `
                <div class = "product-item">
                    <div class = "product-img">
                        <img src = "${product.imgSrc}" alt = "product image">
                        <button type = "button" class = "add-to-cart-btn">
                            <i class = "fas fa-shopping-cart"></i>Agregar al carrito
                        </button>
                    </div>

                    <div class = "product-content">
                        <h3 class = "product-name">${product.name}</h3>
                        <span class = "product-category">${product.category}</span>
                        <p class = "product-price">$${product.price}</p>
                    </div>
                </div>
            `;
      });
      productList.innerHTML = html;
    })
    .catch((error) => {
      alert(`Hubo un error al cargar la informacion: ${error}`); //PONER UN SWEET ALERT Y SACAR COMENTARIO
    });
};

// Funcion de comprar producto

const purchaseProduct = (e) => {
  if (e.target.classList.contains("add-to-cart-btn")) {
    let product = e.target.parentElement.parentElement;
    getProductInfo(product);
    Toastify({
      text: "Plato agregado!",
      className: "info",
      gravity: "top",
      duration: 1000,
      style: {
        background: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
      },
    }).showToast();
  }
};

const getProductInfo = (product) => {
  let productInfo = {
    id: cartItemID,
    imgSrc: product.querySelector(".product-img img").src,
    name: product.querySelector(".product-name").textContent,
    category: product.querySelector(".product-category").textContent,
    price: product.querySelector(".product-price").textContent,
  };
  cartItemID++;
  addToCartList(productInfo);
  saveProductInStorage(productInfo);
};

// Agregamos el producto seleccionado a la lista del carrito

const addToCartList = (product) => {
  const cartItem = document.createElement("div");
  cartItem.classList.add("cart-item");
  cartItem.setAttribute("data-id", `${product.id}`);
  cartItem.innerHTML = `
        <img src = "${product.imgSrc}" alt = "product image">
        <div class = "cart-item-info">
            <h3 class = "cart-item-name">${product.name}</h3>
            <span class = "cart-item-category">${product.category}</span>
            <span class = "cart-item-price">${product.price}</span>
        </div>

        <button type = "button" class = "cart-item-del-btn">
            <i class = "fas fa-times"></i>
        </button>
    `;
  cartList.appendChild(cartItem);
};

// Guardamos el producto en el local storage

const saveProductInStorage = (item) => {
  let product = getProductFromStorage();
  product.push(item);
  localStorage.setItem("product", JSON.stringify(product));
  updateCartInfo();
};

// agarramos toda la info del local storage si es que hay alguna

const getProductFromStorage = () => {
  return localStorage.getItem("product")
    ? JSON.parse(localStorage.getItem("product"))
    : [];
  // retorno un array vacio si no hay nada en el local storage
};

// Cargamos los product del carrito

const loadCart = () => {
  let product = getProductFromStorage();
  if (product.length < 1) {
    cartItemID = 1;
  } else {
    cartItemID = product[product.length - 1].id;
    cartItemID++;
  }
  product.forEach((product) => addToCartList(product));

  updateCartInfo();
};

// Calculo el total del carrito

const findCartInfo = () => {
  let product = getProductFromStorage();
  let total = product.reduce((acc, product) => {
    let price = parseFloat(product.price.substr(1));
    return (acc += price);
  }, 0);

  return {
    total: total.toFixed(2),
    productCount: product.length,
  };
};

// Borrar el producto del carrito y del local storage

const deleteProduct = (e) => {
  let cartItem;
  if (e.target.tagName === "BUTTON") {
    cartItem = e.target.parentElement;
    cartItem.remove();
  } else if (e.target.tagName === "I") {
    cartItem = e.target.parentElement.parentElement;
    cartItem.remove();
  }
  Toastify({
    text: "Plato removido!",
    className: "info",
    gravity: "top",
    duration: 1000,
    style: {
      background: "linear-gradient(to right, #ee6525 0%, #a1381d 100%)",
    },
  }).showToast();

  let product = getProductFromStorage();
  let updatedproduct = product.filter((product) => {
    return product.id !== parseInt(cartItem.dataset.id);
  });
  localStorage.setItem("product", JSON.stringify(updatedproduct));
  updateCartInfo();
};

// Boton para confirmar la compra

const confirmPurchase = () => {
  Swal.fire({
    title: "Quisieras confirmar tu compra?",
    text: "Al confirmar aceptarias llevar todos los productos que estan en tu carrito actualmente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Si, estoy seguro!",
    cancelButtonText: "No, cancelar!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        "Muchas gracias por tu compra!",
        "Vuelve a comprar nuevamente cuando gustes!",
        "success"
      );

      // Si la compra se confirma, se vacia el carrito y el local storage, tambien se updatea la info. Si se cancela, queda todo como estaba

      localStorage.clear();
      cartList.innerHTML = "";
      updateCartInfo();
    }
  });
};

// Todos los Eventlisteners

const eventListeners = () => {
  window.addEventListener("DOMContentLoaded", () => {
    fetchData();
    loadCart();
  });

  document.querySelector(".navbar-toggler").addEventListener("click", () => {
    document.querySelector(".navbar-collapse").classList.toggle("show-navbar");
  });

  document.getElementById("cart-btn").addEventListener("click", () => {
    cartContainer.classList.toggle("show-cart-container");
  });

  productList.addEventListener("click", purchaseProduct);

  cartList.addEventListener("click", deleteProduct);

  confirmPurchaseBtn.addEventListener("click", confirmPurchase);
};

eventListeners();
