
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

const ADMIN_EMAIL = "varshakp172@gmail.com";

function Admin() {
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setCheckingAuth(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setCheckingAuth(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (e) => {
    e.preventDefault();
    setLoginError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoginError("Login failed. Check your email and password.");
      return;
    }

    if (data.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await supabase.auth.signOut();
      setLoginError("This account is not authorized for admin access.");
      return;
    }

    setPassword("");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setOrders([]);
    setMessage("");
  };

  const fetchOrders = async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Unable to load orders. Please try again.");
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [session?.user?.id]);

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

    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
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

  const pageStyle = {
    minHeight: "100vh",
    background: "#fff8f4",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    color: "#5b4037",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    border: "none",
    background: "#bd765f",
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
  };

  if (checkingAuth) {
    return <main style={pageStyle}>Checking admin login...</main>;
  }

  if (!session) {
    return (
      <main style={{ ...pageStyle, display: "grid", placeItems: "center" }}>
        <form
          onSubmit={signIn}
          style={{
            width: "100%",
            maxWidth: "400px",
            boxSizing: "border-box",
            background: "white",
            padding: "30px",
            borderRadius: "14px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ marginTop: 0 }}>TulivThreads Admin</h1>
          <p style={{ color: "#8a6a5d" }}>Sign in to manage customer orders.</p>

          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              margin: "8px 0 18px",
              border: "1px solid #d9b8aa",
              borderRadius: "8px",
            }}
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              margin: "8px 0 18px",
              border: "1px solid #d9b8aa",
              borderRadius: "8px",
            }}
          />

          {loginError && (
            <p role="alert" style={{ color: "#b33a3a" }}>{loginError}</p>
          )}

          <button type="submit" style={{ ...buttonStyle, width: "100%" }}>
            Sign In
          </button>
        </form>
      </main>
    );
  }

  if (session.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return (
      <main style={pageStyle}>
        <h1>Access denied</h1>
        <button onClick={signOut} style={buttonStyle}>Sign Out</button>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "32px" }}>TulivThreads Admin</h1>
            <p style={{ color: "#8a6a5d" }}>Manage customer orders</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={fetchOrders} style={buttonStyle}>Refresh Orders</button>
            <button onClick={signOut} style={buttonStyle}>Sign Out</button>
          </div>
        </header>

        <section
          style={{
            background: "white",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "25px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Total Orders: {orders.length}</h2>
          {message && <p role="alert" style={{ color: "#b33a3a" }}>{message}</p>}
        </section>

        {loading && <p>Loading orders...</p>}

        {!loading && !message && orders.length === 0 && (
          <section style={{ background: "white", padding: "40px", borderRadius: "14px" }}>
            <h2>No orders found</h2>
            <p>New customer orders will appear here.</p>
          </section>
        )}

        {orders.map((order) => (
          <section
            key={order.id}
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "25px",
              marginBottom: "20px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
            }}
          >
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2>Order #{order.id}</h2>
                <p style={{ color: "#8a6a5d" }}>{formatDate(order.created_at)}</p>
              </div>
              <label>
                Status{" "}
                <select
                  value={order.status || "pending"}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #d9b8aa",
                    background: "#fff8f4",
                    color: "#5b4037",
                  }}
                >
                  {["pending", "confirmed", "processing", "ready", "shipped", "delivered", "cancelled"].map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            </header>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "15px",
              }}
            >
              <div><strong>Customer</strong><p>{order.customer_name || "-"}</p></div>
              <div><strong>Phone</strong><p>{order.phone || "-"}</p></div>
              <div><strong>City</strong><p>{order.city || "-"}</p></div>
              <div><strong>Pincode</strong><p>{order.pincode || "-"}</p></div>
            </div>

            <div style={{ background: "#fff8f4", padding: "15px", borderRadius: "10px" }}>
              <strong>Delivery Address</strong>
              <p>{order.address || "-"}</p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid #eadbd4",
                paddingTop: "18px",
                marginTop: "18px",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <strong>Order Total</strong>
              <strong style={{ fontSize: "22px", color: "#bd765f" }}>
                ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
              </strong>
            </div>

            {order.notes && (
              <div style={{ marginTop: "18px", padding: "15px", background: "#f9f1ed", borderRadius: "10px" }}>
                <strong>Customer Notes</strong>
                <p>{order.notes}</p>
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}

export default Admin;
