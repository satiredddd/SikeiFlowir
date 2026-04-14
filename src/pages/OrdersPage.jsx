import { useState, useEffect, useRef } from "react";
import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy, doc, getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import "../styles/Orders.css";

const SIZES = ["Small", "Medium", "Large"];

export default function OrdersPage({ showToast }) {
  const [flowers,    setFlowers]    = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [pricing,    setPricing]    = useState({ small: 0, medium: 0, large: 0, rush: 0 });
  const [loading,    setLoading]    = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [selected,   setSelected]   = useState({});
  const [size,       setSize]       = useState("Small");
  const [isRush,     setIsRush]     = useState(false);
  const [orderNote,  setOrderNote]  = useState("");
  const [saving,     setSaving]     = useState(false);
  const [step,       setStep]       = useState("pick");
  const [copied,     setCopied]     = useState(false);
  const textareaRef = useRef();

  const fetchAll = async () => {
    setLoading(true);
    const flowerSnap = await getDocs(collection(db, "flowers"));
    setFlowers(flowerSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    const ordersQ = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const ordersSnap = await getDocs(ordersQ);
    setOrders(ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    const pricingSnap = await getDoc(doc(db, "settings", "order_pricing"));
    if (pricingSnap.exists()) setPricing(pricingSnap.data());
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleFlowerTap = (id) => {
    setSelected((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDecrement = (id) => {
    setSelected((prev) => {
      const next = { ...prev };
      if ((next[id] || 0) <= 1) delete next[id];
      else next[id] -= 1;
      return next;
    });
  };

  const selectedCount = Object.values(selected).reduce((s, v) => s + v, 0);

  const sizeExtra  = pricing[size.toLowerCase()] || 0;
  const rushExtra  = isRush ? (pricing.rush || 0) : 0;

  const flowerTotal = Object.entries(selected).reduce((sum, [id, count]) => {
    const flower = flowers.find((f) => f.id === id);
    return sum + (parseFloat(flower?.sellingPrice) || 0) * count;
  }, 0);

  const sizeTotal  = sizeExtra * selectedCount;
  const total      = flowerTotal + sizeTotal + rushExtra;

  // ── Live copy-paste text ──────────────────────────────────────────
  const buildCopyText = () => {
    const lines = [];

    // Flowers
    Object.entries(selected).forEach(([id, count]) => {
      const flower = flowers.find((f) => f.id === id);
      if (!flower) return;
      const cost = (parseFloat(flower.sellingPrice) || 0) * count;
      lines.push(
        `${flower.name} (${count}) - ₱${cost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
      );
    });

    // Size
    if (sizeTotal > 0) {
      lines.push(
        `${size} Bouquet - ₱${sizeTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
      );
    }

    // Rush
    if (isRush && rushExtra > 0) {
      lines.push(
        `Rush Order - ₱${rushExtra.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
      );
    }

    // Total
    lines.push(
      `= ₱${total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
    );

    return lines.join("\n");
  };

  const handleCopy = () => {
    const text = buildCopyText();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Safari fallback
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const computeTotal = () => total;

  const handleDone = () => {
    if (selectedCount === 0) return;
    setStep("review");
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    const orderItems = Object.entries(selected).map(([id, count]) => {
      const flower = flowers.find((f) => f.id === id);
      return {
        flowerId:     id,
        flowerName:   flower?.name || "Unknown",
        count,
        sellingPrice: parseFloat(flower?.sellingPrice) || 0,
      };
    });
    await addDoc(collection(db, "orders"), {
      items:     orderItems,
      size,
      sizeExtra,
      isRush,
      rushExtra,
      note:      orderNote.trim(),
      total:     computeTotal(),
      createdAt: serverTimestamp(),
    });
    await fetchAll();
    setSelected({});
    setSize("Small");
    setIsRush(false);
    setOrderNote("");
    setStep("pick");
    setShowPicker(false);
    setSaving(false);
    showToast("🧾 Order saved!");
  };

  const handleCancel = () => {
    setSelected({});
    setSize("Small");
    setIsRush(false);
    setOrderNote("");
    setStep("pick");
    setShowPicker(false);
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <p className="page-sub">Create and track your flower orders</p>
      </div>

      {!showPicker && (
        <div className="orders-toolbar">
          <button className="btn-primary" onClick={() => { setShowPicker(true); setStep("pick"); }}>
            + New Order
          </button>
        </div>
      )}

      {/* ── Step 1: Flower Picker ── */}
      {showPicker && step === "pick" && (
        <div className="order-panel">
          <div className="order-panel-header">
            <h2>Select Flowers</h2>
            <span className="selected-count">
              {selectedCount > 0 ? `${selectedCount} selected` : "Tap to select"}
            </span>
          </div>

          <div className="flower-picker-grid">
            {flowers.map((flower) => {
              const count = selected[flower.id] || 0;
              return (
                <div
                  key={flower.id}
                  className={`picker-card ${count > 0 ? "selected" : ""}`}
                  onClick={() => handleFlowerTap(flower.id)}
                >
                  <div className="picker-img-wrap">
                    {flower.imageUrl ? (
                      <img src={flower.imageUrl} alt={flower.name} className="picker-img" />
                    ) : (
                      <div className="picker-img-placeholder">🌸</div>
                    )}
                    {count > 0 && <div className="picker-badge">{count}</div>}
                  </div>
                  <div className="picker-info">
                    <span className="picker-name">{flower.name}</span>
                    <span className="picker-price">
                      ₱{parseFloat(flower.sellingPrice || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {count > 0 && (
                    <button
                      className="picker-minus"
                      onClick={(e) => { e.stopPropagation(); handleDecrement(flower.id); }}
                    >−</button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="order-panel-footer">
            <button className="btn-ghost" onClick={handleCancel}>Cancel</button>
            <button className="btn-primary" onClick={handleDone} disabled={selectedCount === 0}>
              Done ({selectedCount})
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Review ── */}
      {showPicker && step === "review" && (
        <div className="order-panel">
          <div className="order-panel-header">
            <h2>Order Summary</h2>
          </div>

          {/* Flower list */}
          <div className="order-summary-list">
            {Object.entries(selected).map(([id, count]) => {
              const flower = flowers.find((f) => f.id === id);
              return (
                <div className="order-summary-row" key={id}>
                  <span className="order-summary-name">{flower?.name || "Unknown"}</span>
                  <span className="order-summary-count">×{count}</span>
                  <span className="order-summary-price">
                    ₱{((parseFloat(flower?.sellingPrice) || 0) * count).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
            <div className="order-summary-row total-row">
              <span className="order-summary-name">Total Flowers</span>
              <span className="order-summary-count">×{selectedCount}</span>
              <span className="order-summary-price"></span>
            </div>
          </div>

          {/* Size */}
          <div className="order-section">
            <h3 className="order-section-title">Size</h3>
            <div className="size-btns">
              {SIZES.map((s) => (
                <button
                  key={s}
                  className={`size-btn ${size === s ? "active" : ""}`}
                  onClick={() => setSize(s)}
                >
                  <span>{s}</span>
                  <span className="size-extra">
                    +₱{(pricing[s.toLowerCase()] || 0).toLocaleString("en-PH")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Rush */}
          <div className="order-section">
            <h3 className="order-section-title">Rush Order</h3>
            <button
              className={`rush-btn ${isRush ? "active" : ""}`}
              onClick={() => setIsRush(!isRush)}
            >
              <div className="rush-left">
                <span className="rush-icon">⚡</span>
                <div>
                  <span className="rush-label">Rush Order</span>
                  <span className="rush-sub">+₱{(pricing.rush || 0).toLocaleString("en-PH")} extra</span>
                </div>
              </div>
              <div className={`rush-toggle ${isRush ? "on" : ""}`} />
            </button>
          </div>

          {/* Note */}
          <div className="order-section">
            <h3 className="order-section-title">Note (optional)</h3>
            <textarea
              className="order-note"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="e.g. Customer name, special requests…"
              rows={2}
            />
          </div>

          {/* Total */}
          <div className="order-total-box">
            <span className="order-total-label">Total</span>
            <span className="order-total-value">
              ₱{computeTotal().toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* ── Live Copy Box ── */}
          <div className="order-section">
            <div className="copy-box-header">
              <h3 className="order-section-title" style={{ margin: 0 }}>Copy & Paste</h3>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>
            <textarea
              ref={textareaRef}
              className="copy-textarea"
              value={buildCopyText()}
              readOnly
              rows={Object.keys(selected).length + (sizeTotal > 0 ? 1 : 0) + (isRush ? 1 : 0) + 1}
            />
          </div>

          <div className="order-panel-footer">
            <button className="btn-ghost" onClick={() => setStep("pick")}>← Back</button>
            <button className="btn-primary" onClick={handleSaveOrder} disabled={saving}>
              {saving ? "Saving…" : "Save Order"}
            </button>
          </div>
        </div>
      )}

      {/* ── Orders List ── */}
      <div className="orders-list">
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">No orders yet. Create one!</div>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-card-header">
                <div className="order-meta">
                  <span className="order-date">
                    {order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleDateString("en-PH", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "—"}
                  </span>
                  <div className="order-tags">
                    <span className="order-tag size">{order.size}</span>
                    {order.isRush && <span className="order-tag rush">⚡ Rush</span>}
                  </div>
                </div>
                <span className="order-total">
                  ₱{(order.total || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="order-items">
                {(order.items || []).map((item, i) => (
                  <div className="order-item-row" key={i}>
                    <span className="order-item-name">{item.flowerName}</span>
                    <span className="order-item-count">×{item.count}</span>
                  </div>
                ))}
              </div>
              {order.note && <p className="order-note-display">📝 {order.note}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}