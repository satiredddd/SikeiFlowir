import { useState } from "react";
import "../styles/Modal.css";

const PRESET_COLORS = [
  { name: "Red",    hex: "#ef4444" },
  { name: "Pink",   hex: "#ec4899" },
  { name: "Orange", hex: "#f97316" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Green",  hex: "#22c55e" },
  { name: "Teal",   hex: "#14b8a6" },
  { name: "Blue",   hex: "#3b82f6" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Brown",  hex: "#92400e" },
  { name: "White",  hex: "#f3f4f6" },
  { name: "Gray",   hex: "#6b7280" },
  { name: "Black",  hex: "#111827" },
];

export default function FuzzyWireModal({ item, onClose, onSave }) {
  const [name,      setName]      = useState(item?.name      || "");
  const [colorName, setColorName] = useState(item?.colorName || "");
  const [colorHex,  setColorHex]  = useState(item?.colorHex  || "#ef4444");
  const [stock,     setStock]     = useState(item?.stock     ?? "");
  const [saving,    setSaving]    = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      name:      name.trim(),
      colorName: colorName.trim(),
      colorHex,
      stock:     parseInt(stock) || 0,
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? "Edit Fuzzy Wire" : "Add Fuzzy Wire"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} className="modal-form">

          {/* Color Picker */}
          <div className="field-group">
            <label>Color</label>
            <div className="color-presets">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  className={`preset-swatch ${colorHex === c.hex ? "selected" : ""}`}
                  style={{ background: c.hex }}
                  onClick={() => { setColorHex(c.hex); setColorName(c.name); }}
                  title={c.name}
                />
              ))}
            </div>
            <div className="custom-color-row">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="color-input-native"
              />
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="Color name (e.g. Pastel Pink)"
                className="color-name-input"
              />
            </div>
          </div>

          {/* Wire Name */}
          <div className="field-group">
            <label>Wire Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chenille Wire #3"
              required
              autoFocus
            />
          </div>

          {/* Stock only — no cost */}
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

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : item ? "Save Changes" : "Add Wire"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}