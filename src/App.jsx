import { useState } from "react";
import "./App.css";
import { supabase } from "./lib/supabase";

const products = [
  {
    id: 1,
    name: "Bear Couple Keychain",
    price: 400,
    image: "/products/bear-couple-keychain.png",
    colors: ["Brown", "Cream"],
  },
  {
    id: 2,
    name: "Bunny Heart Keychain",
    price: 250,
    image: "/products/crochet-bunny-heart-keychain.png",
    colors: ["Pink", "White"],
  },
  {
    id: 3,
    name: "Cozy Teddy",
    price: 1200,
    image: "/products/crochet-cozy-bear-plushie.png",
    colors: ["Brown", "Cream"],
  },
  {
    id: 4,
    name: "Elephant",
    price: 1200,
    image: "/products/crochet-cozy-elephant-plushie.png",
    colors: ["Grey", "Pink"],
  },
  {
    id: 5,
    name: "Crochet Bag",
    price: 1500,
    image: "/products/crochet-floral-drawstring-bag.png",
    colors: ["Pink", "White", "Lavender"],
  },
  {
    id: 6,
    name: "Heart Lavender",
    price: 250,
    image: "/products/crochet-heart-flower-bouquet.png",
    colors: ["Lavender", "Purple"],
  },
  {
    id: 7,
    name: "Tulip Bouquet",
    price: 1000,
    image: "/products/crochet-mixed-rose-tulip-bouquet.png",
    colors: ["Pink", "Yellow", "Purple"],
  },
  {
    id: 8,
    name: "Bouquet",
    price: 800,
    image: "/products/crochet-heart-led-bouquet.png",
    colors: ["Pink", "Red", "White"],
  },
  {
    id: 9,
    name: "Gloves",
    price: 500,
    image: "/products/crochet-paw-mittens.png",
    colors: ["Pink", "Brown", "White"],
  },
  {
    id: 10,
    name: "Penguin Couple Keychain",
    price: 400,
    image: "/products/crochet-penguin-heart-keychain.png",
    colors: ["Black", "White"],
  },
  {
    id: 11,
    name: "Pink Bow Keychain",
    price: 80,
    image: "/products/crochet-pink-bow-keychain.png",
    colors: ["Pink", "White"],
  },
  {
    id: 12,
    name: "Mini Bouquet",
    price: 50,
    image: "/products/crochet-pink-flower-mini-bouquet.png",
    colors: ["Pink", "Yellow", "White"],
  },
  {
    id: 13,
    name: "Roses Bouquet",
    price: 500,
    image: "/products/crochet-rose-bouquet.png",
    colors: ["Red", "Pink", "White"],
  },
  {
    id: 14,
    name: "Beanie",
    price: 500,
    image: "/products/crochet-spiderman-beanie-set.png",
    colors: ["Red", "Black", "Blue"],
  },
  {
    id: 15,
    name: "Volleyball Keychain",
    price: 80,
    image: "/products/crochet-volleyball-keychain.png",
    colors: ["White"],
  },
  {
    id: 16,
    name: "Duck",
    price: 200,
    image: "/products/crochet-duckling-plushie.png",
    colors: ["Yellow", "Orange"],
  },
];

function App() {
  const [cart, setCart] = useState([]);
  const [selectedColors, setSelectedColors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);

  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });

  const addToCart = (product, quantity = 1) => {
    const color =
      selectedColors[product.id] || product.colors[0];

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) =>
          item.id === product.id &&
          item.color === color
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id &&
          item.color === color
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          color,
          quantity,
        },
      ];
    });
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setProductQuantity(1);
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    setProductQuantity(1);
  };

  const addProductFromDetails = () => {
    if (!selectedProduct) return;

    addToCart(selectedProduct, productQuantity);
    closeProduct();
  };

  const increaseQuantity = (id, color) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id && item.color === color
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id, color) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id && item.color === color
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id, color) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          !(item.id === id && item.color === color)
      )
    );
  };

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const delivery = subtotal > 0 ? 50 : 0;
  const total = subtotal + delivery;

  const openCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setShowCheckout(true);
    setOrderPlaced(false);
  };

  const closeCheckout = () => {
    if (!isPlacingOrder) {
      setShowCheckout(false);
    }
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    setCustomerDetails((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (isPlacingOrder) return;

    if (
      !customerDetails.name.trim() ||
      !customerDetails.phone.trim() ||
      !customerDetails.address.trim() ||
      !customerDetails.city.trim() ||
      !customerDetails.pincode.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const itemSummary = cart.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.price,
        item_total: item.price * item.quantity,
      }));

      /*
        SAVE ORDER TO SUPABASE
      */
      const { error } = await supabase
        .from("orders")
        .insert([
          {
            customer_name:
              customerDetails.name.trim(),

            phone:
              customerDetails.phone.trim(),

            address:
              customerDetails.address.trim(),

            city:
              customerDetails.city.trim(),

            pincode:
              customerDetails.pincode.trim(),

            notes:
              customerDetails.notes.trim() || null,

            items: itemSummary,

            total_amount: total,

            status: "pending",
          },
        ]);

      if (error) {
        console.error(
          "Supabase order error:",
          error
        );

        alert(
          `We could not save your order.\n\n${error.message}`
        );

        return;
      }

      setOrderPlaced(true);
    } catch (error) {
      console.error(
        "Order submission error:",
        error
      );

      alert(
        "Something went wrong while placing the order. Please try again."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const resetAfterOrder = () => {
    setCart([]);
    setShowCheckout(false);
    setOrderPlaced(false);

    setCustomerDetails({
      name: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
      notes: "",
    });
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <img
            src="/tulivthreads-logo.png"
            alt="TulivThreads"
          />
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#custom">Custom Orders</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#cart">
            Cart ({totalItems})
          </a>
        </div>
      </nav>


      {/* HERO */}
      <section
        className="hero"
        id="home"
      >
        <div className="hero-content">
          <p className="small-title">
            HANDMADE WITH LOVE
          </p>

          <h1>
            Cute Crochet
            <br />
            Made Just For You
          </h1>

          <p>
            Handmade crochet creations crafted
            with care, creativity and lots of love.
          </p>

          <a
            href="#shop"
            className="hero-button"
          >
            Shop Collection
          </a>
        </div>

        <div className="hero-decoration">
          <img
            src="/hero-crochet.png"
            alt="Crochet handmade illustration"
          />
        </div>
      </section>


      {/* SHOP */}
      <section
        className="shop-section"
        id="shop"
      >
        <div className="section-heading">
          <p>OUR COLLECTION</p>

          <h2>
            Shop Handmade Crochet
          </h2>

          <span>
            Discover cute handmade pieces made
            specially for you.
          </span>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <div
              className="product-card"
              key={product.id}
            >
              <div
                className="product-image"
                onClick={() =>
                  openProduct(product)
                }
                style={{
                  cursor: "pointer",
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                />
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>

                <p className="price">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>

                <div className="color-selector">
                  <span>Colour:</span>

                  <div className="color-options">
                    {product.colors.map(
                      (color) => (
                        <button
                          key={color}
                          type="button"
                          className={
                            selectedColors[
                              product.id
                            ] === color
                              ? "color-btn active"
                              : "color-btn"
                          }
                          onClick={() =>
                            setSelectedColors(
                              (current) => ({
                                ...current,
                                [product.id]:
                                  color,
                              })
                            )
                          }
                        >
                          {color}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="view-product-btn"
                  onClick={() =>
                    openProduct(product)
                  }
                >
                  View Product
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* CUSTOM ORDERS */}
      <section
        className="custom-section"
        id="custom"
      >
        <div className="custom-content">
          <p className="small-title">
            MADE FOR YOU
          </p>

          <h2>
            Want Something Custom?
          </h2>

          <p>
            Tell us what you have in mind.
            We can create a special crochet
            piece just for you.
          </p>

          <button
            type="button"
            onClick={() =>
              alert(
                "Custom Orders will be available soon!"
              )
            }
          >
            Request Custom Order
          </button>
        </div>
      </section>


      {/* ABOUT */}
      <section
        className="about-section"
        id="about"
      >
        <div className="section-heading">
          <p>ABOUT US</p>

          <h2>Made With Love</h2>

          <span>
            TulivThreads creates handmade crochet
            products with care, creativity and
            attention to detail.
          </span>
        </div>
      </section>


      {/* CART */}
      <section
        className="cart-section"
        id="cart"
      >
        <div className="section-heading">
          <p>YOUR SHOPPING BAG</p>

          <h2>Your Cart</h2>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty.</p>

            <a
              href="#shop"
              className="hero-button"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="cart-container">

            <div className="cart-items">
              {cart.map((item) => (
                <div
                  className="cart-item"
                  key={`${item.id}-${item.color}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                  />

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>

                    <p>
                      Colour: {item.color}
                    </p>

                    <p>
                      ₹
                      {item.price.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(
                            item.id,
                            item.color
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(
                            item.id,
                            item.color
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() =>
                        removeFromCart(
                          item.id,
                          item.color
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className="cart-item-total">
                    ₹
                    {(
                      item.price *
                      item.quantity
                    ).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>

              <div>
                <span>Subtotal</span>
                <span>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div>
                <span>Delivery</span>
                <span>₹{delivery}</span>
              </div>

              <div className="total-row">
                <strong>Total</strong>

                <strong>
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <button
                type="button"
                className="checkout-button"
                onClick={openCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </section>


      {/* FOOTER */}
      <footer id="contact">
        <div>
          <h3>TulivThreads</h3>

          <p>
            Handmade crochet creations made
            with love.
          </p>
        </div>

        <div>
          <p>
            WhatsApp: Coming Soon
          </p>

          <p>
            Instagram: Coming Soon
          </p>
        </div>

        <div>
          © 2026 TulivThreads. All rights
          reserved.
        </div>
      </footer>


      {/* PRODUCT DETAILS POPUP */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(60, 40, 35, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={closeProduct}
        >
          <div
            style={{
              background: "#fffaf7",
              borderRadius: "20px",
              padding: "25px",
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={closeProduct}
              style={{
                position: "absolute",
                right: "15px",
                top: "15px",
                border: "none",
                background: "#ead7ce",
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              style={{
                width: "100%",
                maxHeight: "350px",
                objectFit: "contain",
                borderRadius: "15px",
              }}
            />

            <h2
              style={{
                color: "#5e4840",
                marginTop: "20px",
              }}
            >
              {selectedProduct.name}
            </h2>

            <p
              style={{
                color: "#a86758",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              ₹
              {selectedProduct.price.toLocaleString(
                "en-IN"
              )}
            </p>

            <p
              style={{
                color: "#765c52",
                marginTop: "15px",
              }}
            >
              Choose your colour:
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                margin: "10px 0 20px",
              }}
            >
              {selectedProduct.colors.map(
                (color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setSelectedColors(
                        (current) => ({
                          ...current,
                          [selectedProduct.id]:
                            color,
                        })
                      )
                    }
                    style={{
                      padding: "9px 15px",
                      borderRadius: "20px",
                      border:
                        selectedColors[
                          selectedProduct.id
                        ] === color
                          ? "2px solid #a86758"
                          : "1px solid #dbc5bb",
                      background:
                        selectedColors[
                          selectedProduct.id
                        ] === color
                          ? "#f1ddd5"
                          : "white",
                      cursor: "pointer",
                    }}
                  >
                    {color}
                  </button>
                )
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <span>Quantity:</span>

              <button
                type="button"
                onClick={() =>
                  setProductQuantity(
                    Math.max(
                      1,
                      productQuantity - 1
                    )
                  )
                }
                style={{
                  width: "35px",
                  height: "35px",
                  border: "none",
                  borderRadius: "50%",
                  background: "#ead7ce",
                  cursor: "pointer",
                }}
              >
                −
              </button>

              <strong>
                {productQuantity}
              </strong>

              <button
                type="button"
                onClick={() =>
                  setProductQuantity(
                    productQuantity + 1
                  )
                }
                style={{
                  width: "35px",
                  height: "35px",
                  border: "none",
                  borderRadius: "50%",
                  background: "#ead7ce",
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={addProductFromDetails}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "30px",
                background: "#b97867",
                color: "white",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}


      {/* CHECKOUT POPUP */}
      {showCheckout && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(60, 40, 35, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
          onClick={closeCheckout}
        >
          <div
            style={{
              background: "#fffaf7",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "900px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={closeCheckout}
              disabled={isPlacingOrder}
              style={{
                position: "absolute",
                right: "15px",
                top: "15px",
                border: "none",
                background: "#ead7ce",
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: 5,
              }}
            >
              ×
            </button>

            {!orderPlaced ? (
              <div
                style={{
                  padding: "35px",
                }}
              >
                <div
                  className="section-heading"
                  style={{
                    marginBottom: "30px",
                  }}
                >
                  <p>CHECKOUT</p>

                  <h2>
                    Customer Details
                  </h2>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
                    gap: "30px",
                  }}
                >

                  {/* CUSTOMER FORM */}
                  <form
                    onSubmit={placeOrder}
                  >
                    <div
                      style={{
                        marginBottom: "18px",
                      }}
                    >
                      <label>
                        Full Name *
                      </label>

                      <input
                        name="name"
                        value={
                          customerDetails.name
                        }
                        onChange={
                          handleCustomerChange
                        }
                        placeholder="Enter your name"
                        required
                        style={inputStyle}
                      />
                    </div>

                    <div
                      style={{
                        marginBottom: "18px",
                      }}
                    >
                      <label>
                        Phone Number *
                      </label>

                      <input
                        name="phone"
                        value={
                          customerDetails.phone
                        }
                        onChange={
                          handleCustomerChange
                        }
                        placeholder="Enter phone number"
                        required
                        style={inputStyle}
                      />
                    </div>

                    <div
                      style={{
                        marginBottom: "18px",
                      }}
                    >
                      <label>
                        Address *
                      </label>

                      <textarea
                        name="address"
                        value={
                          customerDetails.address
                        }
                        onChange={
                          handleCustomerChange
                        }
                        placeholder="Enter delivery address"
                        rows="3"
                        required
                        style={textareaStyle}
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "1fr 1fr",
                        gap: "15px",
                        marginBottom: "18px",
                      }}
                    >
                      <div>
                        <label>
                          City *
                        </label>

                        <input
                          name="city"
                          value={
                            customerDetails.city
                          }
                          onChange={
                            handleCustomerChange
                          }
                          placeholder="City"
                          required
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label>
                          Pincode *
                        </label>

                        <input
                          name="pincode"
                          value={
                            customerDetails.pincode
                          }
                          onChange={
                            handleCustomerChange
                          }
                          placeholder="Pincode"
                          required
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        marginBottom: "20px",
                      }}
                    >
                      <label>
                        Order Notes
                      </label>

                      <textarea
                        name="notes"
                        value={
                          customerDetails.notes
                        }
                        onChange={
                          handleCustomerChange
                        }
                        placeholder="Any special instructions?"
                        rows="3"
                        style={textareaStyle}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPlacingOrder}
                      style={{
                        width: "100%",
                        padding: "15px",
                        border: "none",
                        borderRadius: "30px",
                        background:
                          isPlacingOrder
                            ? "#c9a69a"
                            : "#b97867",
                        color: "white",
                        fontSize: "16px",
                        cursor:
                          isPlacingOrder
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {isPlacingOrder
                        ? "Saving Order..."
                        : "Place Order"}
                    </button>
                  </form>


                  {/* ORDER SUMMARY */}
                  <div
                    style={{
                      background: "#f6e8e1",
                      borderRadius: "18px",
                      padding: "25px",
                      height: "fit-content",
                    }}
                  >
                    <h3
                      style={{
                        color: "#5e4840",
                        marginBottom: "20px",
                      }}
                    >
                      Your Order
                    </h3>

                    {cart.map((item) => (
                      <div
                        key={`${item.id}-${item.color}`}
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: "12px",
                          paddingBottom: "15px",
                          marginBottom: "15px",
                          borderBottom:
                            "1px solid #dfc9bf",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              color: "#5e4840",
                              fontWeight:
                                "bold",
                              marginBottom:
                                "5px",
                            }}
                          >
                            {item.name}
                          </p>

                          <p
                            style={{
                              fontSize: "13px",
                              color: "#765c52",
                            }}
                          >
                            {item.color} ×{" "}
                            {item.quantity}
                          </p>
                        </div>

                        <p
                          style={{
                            color: "#a86758",
                            fontWeight:
                              "bold",
                          }}
                        >
                          ₹
                          {(
                            item.price *
                            item.quantity
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    ))}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: "10px",
                        color: "#765c52",
                      }}
                    >
                      <span>
                        Subtotal
                      </span>

                      <span>
                        ₹
                        {subtotal.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: "15px",
                        color: "#765c52",
                      }}
                    >
                      <span>
                        Delivery
                      </span>

                      <span>
                        ₹{delivery}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        paddingTop: "15px",
                        borderTop:
                          "1px solid #dfc9bf",
                        fontSize: "20px",
                        fontWeight:
                          "bold",
                        color: "#5e4840",
                      }}
                    >
                      <span>Total</span>

                      <span>
                        ₹
                        {total.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SUCCESS SCREEN */
              <div
                style={{
                  textAlign: "center",
                  padding: "45px 20px",
                }}
              >
                <div
                  style={{
                    width: "75px",
                    height: "75px",
                    borderRadius: "50%",
                    background: "#dcefdc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    margin:
                      "0 auto 20px",
                    fontSize: "38px",
                  }}
                >
                  ✓
                </div>

                <p className="small-title">
                  TULIVTHREADS
                </p>

                <h2
                  style={{
                    fontSize: "36px",
                    fontWeight: "500",
                    color: "#604a42",
                    marginBottom: "15px",
                  }}
                >
                  Order Details Received!
                </h2>

                <p
                  style={{
                    maxWidth: "600px",
                    margin:
                      "0 auto 15px",
                    color: "#765c52",
                    lineHeight: "1.7",
                  }}
                >
                  Thank you,{" "}
                  <strong>
                    {customerDetails.name}
                  </strong>
                  !
                </p>

                <p
                  style={{
                    maxWidth: "600px",
                    margin:
                      "0 auto 25px",
                    color: "#765c52",
                    lineHeight: "1.7",
                  }}
                >
                  Your order information
                  has been saved
                  successfully. We will
                  contact you on{" "}
                  <strong>
                    {customerDetails.phone}
                  </strong>{" "}
                  to confirm the order
                  and payment details.
                </p>

                <div
                  style={{
                    background: "#f6e8e1",
                    borderRadius: "15px",
                    padding: "20px",
                    maxWidth: "500px",
                    margin:
                      "0 auto 25px",
                    textAlign: "left",
                  }}
                >
                  <p
                    style={{
                      marginBottom:
                        "8px",
                      color: "#5e4840",
                    }}
                  >
                    <strong>
                      Delivery Address:
                    </strong>
                  </p>

                  <p
                    style={{
                      color: "#765c52",
                      lineHeight: "1.6",
                    }}
                  >
                    {customerDetails.address}
                    <br />
                    {customerDetails.city} -{" "}
                    {customerDetails.pincode}
                  </p>
                </div>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#8a7066",
                    marginBottom:
                      "25px",
                  }}
                >
                  Total order value: ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </p>

                <button
                  type="button"
                  onClick={resetAfterOrder}
                  style={{
                    padding:
                      "14px 28px",
                    border: "none",
                    borderRadius: "30px",
                    background:
                      "#b97867",
                    color: "white",
                    fontSize: "15px",
                    cursor: "pointer",
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px",
  border: "1px solid #dbc5bb",
  borderRadius: "8px",
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box",
};

const textareaStyle = {
  width: "100%",
  padding: "13px",
  border: "1px solid #dbc5bb",
  borderRadius: "8px",
  outline: "none",
  fontSize: "14px",
  resize: "vertical",
  boxSizing: "border-box",
};

export default App;