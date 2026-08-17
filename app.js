const API_ORDER = "/api/orders";
const API_PAYMENT = "/api/payments";

if (document.getElementById("products")) {
  fetch(`${API_ORDER}/products`)
    .then(res => res.json())
    .then(products => {
      const container = document.getElementById("products");
      products.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>${p.name}</h3>
          <p>₹${p.price}</p>
          <button onclick="buy(${p.id}, '${p.name}', ${p.price})">Buy</button>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error("Failed to load products:", err));
}

function buy(id, name, price) {
  localStorage.setItem("selectedProduct", JSON.stringify({ id, name, price }));
  window.location.href = "checkout.html";
}

if (document.getElementById("checkout-summary")) {
  const product = JSON.parse(localStorage.getItem("selectedProduct"));
  if (product) {
    document.getElementById("checkout-summary").innerHTML = `<p>${product.name} - ₹${product.price}</p>`;
  }

  document.getElementById("pay-btn").addEventListener("click", () => {
    fetch(`${API_ORDER}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: product.id })
    })
      .then(res => res.json())
      .then(order => {
        document.getElementById("order-status").innerText = `Order #${order.order_id} created — proceeding to payment...`;
        return fetch(`${API_PAYMENT}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: order.order_id, amount: product.price })
        });
      })
      .then(res => res.json())
      .then(payment => {
        document.getElementById("result").innerText = `Payment ${payment.status}. Transaction: ${payment.transaction_id}`;
      })
      .catch(err => {
        document.getElementById("result").innerText = "Payment failed.";
        console.error(err);
      });
  });
}