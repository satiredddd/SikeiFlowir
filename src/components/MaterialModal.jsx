import { useState } from "react";
import "../styles/Modal.css";

export default function MaterialModal({ item, onClose, onSave }) {
  const [name,        setName]        = useState(item?.name        || "");
  const [stock,       setStock]       = useState(item?.stock       ?? "");
  const [bundlePrice, setBundlePrice] = useState(item?.bundlePrice ?? "");
  const [bundleSize,  setBundleSize]  = useState(item?.bundleSize  ?? "100");
  const [saving, setSaving] = useState(false);

  const perPiece = bundlePrice && bundleSize
    ? (parseFloat(bundlePrice) / parseInt(bundleSize))
    : 0;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      name:        name.trim(),
      stock:       parseInt(stock)        || 0,
      bundlePrice: parseFloat(bundlePrice) || 0,
      bundleSize:  parseInt(bundleSize)    || 100,
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? "Edit Material" : "Add Material"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          <div className="field-group">
            <label>Material Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Glue Gun Sticks"
              required
              autoFocus
            />
          </div>

          <div className="field-group">
            <label>Stock Count</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="field-row">
            <div className="field-group">
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
            <div className="field-group">
              <label>Pcs per Bundle</label>
              <input
                type="number"
                value={bundleSize}
                onChange={(e) => setBundleSize(e.target.value)}
                placeholder="e.g. 100"
                min="1"
              />
            </div>
          </div>

          {/* Live preview */}
          {perPiece > 0 && (
            <div className="cost-preview">
              ₱{parseFloat(bundlePrice).toFixed(2)} ÷ {bundleSize} pcs
              = <strong>₱{perPiece.toFixed(4)} per piece</strong>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : item ? "Save Changes" : "Add Material"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}