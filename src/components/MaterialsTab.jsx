import { useState, useEffect } from "react";
import {
  collection, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, getDoc, setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import MaterialModal from "./MaterialModal";
import ConfirmModal from "./ConfirmModal";
import "../styles/FuzzyWire.css";

export default function MaterialsTab({ items, loading, onRefresh, showToast }) {
  const [showModal, setShowModal]       = useState(false);
  const [editItem, setEditItem]         = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Bundle cost settings per material are set in the modal
  // Summary box shows total value across all materials
  const totalStock = items.reduce((sum, i) => sum + (i.stock || 0), 0);
  const totalValue = items.reduce((sum, i) => {
    const pricePerPiece = i.bundlePrice && i.bundleSize
      ? i.bundlePrice / i.bundleSize
      : 0;
    return sum + pricePerPiece * (i.stock || 0);
  }, 0);

  const handleAdd = async (data) => {
    await addDoc(collection(db, "materials"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    await onRefresh();
    setShowModal(false);
    showToast("✅ Material added!");
  };

  const handleEdit = async (data) => {
    await updateDoc(doc(db, "materials", editItem.id), data);
    await onRefresh();
    setEditItem(null);
    showToast("✏️ Material updated!");
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "materials", deleteTarget.id));
    await onRefresh();
    setDeleteTarget(null);
    showToast("🗑️ Material deleted.");
  };

  return (
    <div className="tab-content">

      {/* ── Summary Box ── */}
      <div className="summary-box">
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="summary-label">Total Items</span>
            <span className="summary-value">{items.length}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Total Units</span>
            <span className="summary-value">{totalStock.toLocaleString()}</span>
          </div>
          <div className="summary-stat accent">
            <span className="summary-label">Total Value</span>
            <span className="summary-value">
              {totalValue > 0
                ? `₱${totalValue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="tab-toolbar">
        <span className="item-count">{items.length} materials</span>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Material
        </button>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">No materials yet. Add one!</div>
      ) : (
        <div className="table-wrapper">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="num-col">Stock</th>
                <th className="num-col">Bundle Price</th>
                <th className="num-col">Per Piece</th>
                <th className="num-col">Total Value</th>
                <th className="action-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const perPiece = item.bundlePrice && item.bundleSize
                  ? item.bundlePrice / item.bundleSize
                  : 0;
                const itemTotal = perPiece * (item.stock || 0);
                return (
                  <tr key={item.id}>
                    <td className="item-name">{item.name}</td>
                    <td className="num-col">{item.stock ?? 0}</td>
                    <td className="num-col">
                      {item.bundlePrice
                        ? `₱${item.bundlePrice} / ${item.bundleSize}pcs`
                        : <span className="muted">—</span>}
                    </td>
                    <td className="num-col">
                      {perPiece > 0
                        ? `₱${perPiece.toFixed(4)}`
                        : <span className="muted">—</span>}
                    </td>
                    <td className="num-col total-col">
                      {itemTotal > 0
                        ? `₱${itemTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                        : <span className="muted">—</span>}
                    </td>
                    <td className="action-col">
                      <button className="icon-btn edit-btn" onClick={() => setEditItem(item)}>✏️</button>
                      <button className="icon-btn del-btn" onClick={() => setDeleteTarget(item)}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <MaterialModal onClose={() => setShowModal(false)} onSave={handleAdd} />
      )}
      {editItem && (
        <MaterialModal item={editItem} onClose={() => setEditItem(null)} onSave={handleEdit} />
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