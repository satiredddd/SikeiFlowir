import { useState, useEffect } from "react";
import {
  collection, addDoc, getDocs,
  updateDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import WrapperModal from "./WrapperModal";
import ConfirmModal from "./ConfirmModal";
import "../styles/FuzzyWire.css";

export default function WrapperTab({ showToast }) {
  const [items,        setItems]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editItem,     setEditItem]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    const q = query(collection(db, "wrappers"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async (data) => {
    await addDoc(collection(db, "wrappers"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    await fetchItems();
    setShowModal(false);
    showToast("✅ Wrapper added!");
  };

  const handleEdit = async (data) => {
    await updateDoc(doc(db, "wrappers", editItem.id), data);
    await fetchItems();
    setEditItem(null);
    showToast("✏️ Wrapper updated!");
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "wrappers", deleteTarget.id));
    await fetchItems();
    setDeleteTarget(null);
    showToast("🗑️ Wrapper deleted.");
  };

  return (
    <div className="tab-content">
      <div className="tab-toolbar">
        <span className="item-count">{items.length} wrappers</span>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Wrapper
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">No wrappers yet. Add one!</div>
      ) : (
        <div className="wire-list">
          {items.map((item) => {
            const perPiece = item.bundlePrice && item.bundleSize
              ? item.bundlePrice / item.bundleSize
              : 0;
            return (
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

                <div className="wrapper-pricing">
                  <span className="cost-label">Bundle</span>
                  <span className="cost-value">
                    {item.bundlePrice
                      ? `₱${item.bundlePrice} / ${item.bundleSize}pcs`
                      : "—"}
                  </span>
                </div>

                <div className="wrapper-pricing">
                  <span className="cost-label">Per Piece</span>
                  <span className="cost-value">
                    {perPiece > 0 ? `₱${perPiece.toFixed(4)}` : "—"}
                  </span>
                </div>

                <div className="wire-actions">
                  <button className="icon-btn edit-btn" onClick={() => setEditItem(item)}>✏️</button>
                  <button className="icon-btn del-btn" onClick={() => setDeleteTarget(item)}>🗑️</button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <WrapperModal onClose={() => setShowModal(false)} onSave={handleAdd} />
      )}
      {editItem && (
        <WrapperModal item={editItem} onClose={() => setEditItem(null)} onSave={handleEdit} />
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