import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Unable to load orders.");
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Could not update order status.");
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === id
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff8f4",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
        color: "#5b4037",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
              }}
            >
              TulivThreads Admin
            </h1>

            <p
              style={{
                marginTop: "8px",
                color: "#8a6a5d",
              }}
            >
              Manage customer orders
            </p>
          </div>

          <button
            onClick={fetchOrders}
            style={{
              border: "none",
              background: "#bd765f",
              color: "white",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Refresh Orders
          </button>
        </div>

        {/* Summary */}
        <div
          style={{
            background: "white",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "25px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "20px",
            }}
          >
            Total Orders: {orders.length}
          </h2>

          {message && (
            <p
              style={{
                color: "#b33a3a",
                marginBottom: 0,
              }}
            >
              {message}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "14px",
              textAlign: "center",
            }}
          >
            Loading orders...
          </div>
        )}

        {/* No orders */}
        {!loading && orders.length === 0 && (
          <div
            style={{
              background: "white",
              padding: "50px",
              borderRadius: "14px",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
            }}
          >
            <h2>No orders yet</h2>

            <p style={{ color: "#8a6a5d" }}>
              Customer orders will appear here.
            </p>
          </div>
        )}

        {/* Orders */}
        {!loading &&
          orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "25px",
                marginBottom: "20px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
              }}
            >
              {/* Order header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "21px",
                    }}
                  >
                    Order #{order.id}
                  </h2>

                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#8a6a5d",
                      fontSize: "14px",
                    }}
                  >
                    {formatDate(order.created_at)}
                  </p>
                </div>

                <select
                  value={order.status || "pending"}
                  onChange={(e) =>
                    updateStatus(order.id, e.target.value)
                  }
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #d9b8aa",
                    background: "#fff8f4",
                    color: "#5b4037",
                    cursor: "pointer",
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="ready">Ready</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Customer information */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <strong>Customer</strong>
                  <p>{order.customer_name || "-"}</p>
                </div>

                <div>
                  <strong>Phone</strong>
                  <p>{order.phone || "-"}</p>
                </div>

                <div>
                  <strong>City</strong>
                  <p>{order.city || "-"}</p>
                </div>

                <div>
                  <strong>Pincode</strong>
                  <p>{order.pincode || "-"}</p>
                </div>
              </div>

              {/* Address */}
              <div
                style={{
                  background: "#fff8f4",
                  padding: "15px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                }}
              >
                <strong>Delivery Address</strong>
                <p style={{ marginBottom: 0 }}>
                  {order.address || "-"}
                </p>
              </div>

              {/* Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid #eadbd4",
                  paddingTop: "18px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <strong>Order Total</strong>
                </div>

                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    color: "#bd765f",
                  }}
                >
                  ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div
                  style={{
                    marginTop: "18px",
                    padding: "15px",
                    background: "#f9f1ed",
                    borderRadius: "10px",
                  }}
                >
                  <strong>Customer Notes</strong>
                  <p style={{ marginBottom: 0 }}>
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Admin;