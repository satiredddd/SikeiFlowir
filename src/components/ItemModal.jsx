import { useState } from "react";
import "../styles/Modal.css";

export default function ItemModal({ item, onClose, onSave }) {
  const [name, setName] = useState(item?.name || "");
  const [cost, setCost] = useState(item?.cost || "");
  const [quantity, setQuantity] = useState(item?.quantity || "");
  const [category, setCategory] = useState(item?.category || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || cost === "") return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      cost: parseFloat(cost),
      quantity: parseInt(quantity) || 0,
      category: category.trim(),
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2>{item ? "Edit Item" : "Add Item"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          <div className="field-group">
            <label>Item Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wireless Mouse"
              required
              autoFocus
            />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Cost (₱) *</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="field-group">
              <label>Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="field-group">
            <label>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Electronics"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : item ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}