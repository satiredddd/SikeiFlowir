import { useState, useEffect } from "react";
import {
  collection, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, getDoc, setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import FuzzyWireModal from "./FuzzyWireModal";
import ConfirmModal from "./ConfirmModal";
import "../styles/FuzzyWire.css";

export default function FuzzyWireTab({ items, loading, onRefresh, showToast }) {
  const [showModal, setShowModal]       = useState(false);
  const [editItem, setEditItem]         = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingId, setUpdatingId]     = useState(null);

  // Bundle cost settings
  const [bundlePrice, setBundlePrice] = useState("");
  const [bundleSize, setBundleSize]   = useState("100");
  const [savingCost, setSavingCost]   = useState(false);

  // Load saved bundle settings from Firestore
  useEffect(() => {
    const loadSettings = async () => {
      const ref = doc(db, "settings", "fuzzy_wire_cost");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setBundlePrice(snap.data().bundlePrice ?? "");
        setBundleSize(snap.data().bundleSize ?? "100");
      }
    };
    loadSettings();
  }, []);

  const handleSaveCost = async () => {
    setSavingCost(true);
    await setDoc(doc(db, "settings", "fuzzy_wire_cost"), {
      bundlePrice: parseFloat(bundlePrice) || 0,
      bundleSize:  parseInt(bundleSize)    || 100,
    });
    setSavingCost(false);
    showToast("💾 Cost settings saved!");
  };

  // Computations
  const totalStock     = items.reduce((sum, i) => sum + (i.stock || 0), 0);
  const pricePerPiece  = bundlePrice && bundleSize
    ? parseFloat(bundlePrice) / parseInt(bundleSize)
    : 0;
  const totalCost      = totalStock * pricePerPiece;

  const handleAdd = async (data) => {
    await addDoc(collection(db, "fuzzy_wire"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    await onRefresh();
    setShowModal(false);
    showToast("✅ Fuzzy wire added!");
  };

  const handleEdit = async (data) => {
    await updateDoc(doc(db, "fuzzy_wire", editItem.id), data);
    await onRefresh();
    setEditItem(null);
    showToast("✏️ Item updated!");
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "fuzzy_wire", deleteTarget.id));
    await onRefresh();
    setDeleteTarget(null);
    showToast("🗑️ Item deleted.");
  };

  const handleStockUpdate = async (item, delta) => {
    const newStock = Math.max(0, (item.stock || 0) + delta);
    setUpdatingId(item.id);
    await updateDoc(doc(db, "fuzzy_wire", item.id), { stock: newStock });
    await onRefresh();
    setUpdatingId(null);
    showToast(`${delta > 0 ? "➕" : "➖"} Stock updated to ${newStock}`);
  };

  return (
    <div className="tab-content">

      {/* ── Summary Box ── */}
      <div className="summary-box">
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="summary-label">Total Pieces</span>
            <span className="summary-value">{totalStock.toLocaleString()}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Cost per Piece</span>
            <span className="summary-value">
              {pricePerPiece > 0
                ? `₱${pricePerPiece.toFixed(4)}`
                : "—"}
            </span>
          </div>
          <div className="summary-stat accent">
            <span className="summary-label">Total Stock Value</span>
            <span className="summary-value">
              {totalCost > 0
                ? `₱${totalCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                : "—"}
            </span>
          </div>
        </div>

        {/* Bundle cost input */}
        <div className="bundle-cost-row">
          <div className="bundle-field">
            <label>Bundle Price (₱)</label>
            <input
              type="number"
              value={bundlePrice}
              onChange={(e) => setBundlePrice(e.target.value)}
              placeholder="e.g. 39"
              min="0"
              step="0.01"
            />
          </div>
          <div className="bundle-sep">per</div>
          <div className="bundle-field">
            <label>Pieces per Bundle</label>
            <input
              type="number"
              value={bundleSize}
              onChange={(e) => setBundleSize(e.target.value)}
              placeholder="e.g. 100"
              min="1"
            />
          </div>
          <button
            className="btn-primary save-cost-btn"
            onClick={handleSaveCost}
            disabled={savingCost}
          >
            {savingCost ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="tab-toolbar">
        <span className="item-count">{items.length} colors</span>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Wire
        </button>
      </div>

      {/* ── Wire List ── */}
      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">No fuzzy wires yet. Add one!</div>
      ) : (
        <div className="wire-list">
          {items.map((item) => (
            <div className="wire-card" key={item.id}>

              <div className="wire-identity">
                <div
                  className="color-swatch"
                  style={{ background: item.colorHex || "#ccc" }}
                />
                <div className="wire-info">
                  <span className="wire-name">{item.name}</span>
                  <span className="wire-color-label">{item.colorName}</span>
                </div>
              </div>

              <div className="wire-stock">
                <button
                  className="stock-btn minus"
                  onClick={() => handleStockUpdate(item, -100)}
                  disabled={updatingId === item.id}
                >
                  −100
                </button>
                <span className="stock-count">{item.stock ?? 0}</span>
                <button
                  className="stock-btn plus"
                  onClick={() => handleStockUpdate(item, 100)}
                  disabled={updatingId === item.id}
                >
                  +100
                </button>
              </div>

              <div className="wire-actions">
                <button className="icon-btn edit-btn" onClick={() => setEditItem(item)}>✏️</button>
                <button className="icon-btn del-btn" onClick={() => setDeleteTarget(item)}>🗑️</button>
              </div>

            </div>
          ))}
        </div>
      )}

      {showModal && (
        <FuzzyWireModal onClose={() => setShowModal(false)} onSave={handleAdd} />
      )}
      {editItem && (
        <FuzzyWireModal item={editItem} onClose={() => setEditItem(null)} onSave={handleEdit} />
      )}
      {deleteTarget && (
        <ConfirmModal
          itemName={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}