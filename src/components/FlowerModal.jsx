import { useState, useRef } from "react";
import "../styles/Modal.css";
import "../styles/Flowers.css";

const CLOUD_NAME    = "demir77ar";
const UPLOAD_PRESET = "sikei_flowers";

export default function FlowerModal({ item, materials, onClose, onSave, showToast }) {
  const [name,       setName]       = useState(item?.name       || "");
  const [fuzzyCount, setFuzzyCount] = useState(item?.fuzzyCount ?? "");
  const [imageUrl,   setImageUrl]   = useState(item?.imageUrl   || "");
  const [uploading,  setUploading]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const fileRef = useRef();

  const [matRows, setMatRows] = useState(
    item?.materials?.length
      ? item.materials
      : [{ materialId: "", qty: "" }]
  );

  const addMatRow = () => {
    if (matRows.length >= 10) return;
    setMatRows([...matRows, { materialId: "", qty: "" }]);
  };

  const removeMatRow = (i) => {
    setMatRows(matRows.filter((_, idx) => idx !== i));
  };

  const updateMatRow = (i, field, value) => {
    const updated = [...matRows];
    updated[i] = { ...updated[i], [field]: value };
    setMatRows(updated);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res  = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();

      if (data.secure_url) {
        setImageUrl(data.secure_url);
      } else {
        console.error("Cloudinary error:", data);
        alert("❌ Image upload failed. Make sure your Cloudinary preset is set to Unsigned.");
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("❌ Upload error. Check your internet connection.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const cleanedMats = matRows
      .filter((m) => m.materialId && m.qty)
      .map((m) => ({ materialId: m.materialId, qty: parseInt(m.qty) || 0 }));

    await onSave({
      name:       name.trim(),
      fuzzyCount: parseInt(fuzzyCount) || 0,
      imageUrl:   imageUrl || "",
      materials:  cleanedMats,
    });

    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-tall" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? "Edit Flower" : "Add Flower"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} className="modal-form">

          {/* Image Upload */}
          <div className="field-group">
            <label>Flower Image</label>
            <div className="image-upload-area" onClick={() => fileRef.current.click()}>
              {uploading ? (
                <div className="image-placeholder">
                  <span>⏳ Uploading…</span>
                </div>
              ) : imageUrl ? (
                <img src={imageUrl} alt="preview" className="image-preview" />
              ) : (
                <div className="image-placeholder">
                  <span>📷 Tap to add image</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            {imageUrl && !uploading && (
              <button
                type="button"
                className="btn-ghost sm"
                style={{ marginTop: 6 }}
                onClick={() => fileRef.current.click()}
              >
                Change Image
              </button>
            )}
          </div>

          {/* Flower Name */}
          <div className="field-group">
            <label>Flower Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rose Bouquet"
              required
            />
          </div>

          {/* Fuzzy Wire Count */}
          <div className="field-group">
            <label>🧶 Fuzzy Wire needed (pcs)</label>
            <input
              type="number"
              value={fuzzyCount}
              onChange={(e) => setFuzzyCount(e.target.value)}
              placeholder="e.g. 12"
              min="0"
            />
          </div>

          {/* Materials */}
          <div className="field-group">
            <label>🪣 Materials needed</label>
            <div className="mat-rows">
              {matRows.map((row, i) => (
                <div className="mat-row" key={i}>
                  <select
                    value={row.materialId}
                    onChange={(e) => updateMatRow(i, "materialId", e.target.value)}
                    className="mat-select"
                  >
                    <option value="">Select material…</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={row.qty}
                    onChange={(e) => updateMatRow(i, "qty", e.target.value)}
                    placeholder="How many"
                    min="0"
                    className="mat-qty"
                  />
                  {matRows.length > 1 && (
                    <button
                      type="button"
                      className="mat-remove"
                      onClick={() => removeMatRow(i)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {matRows.length < 10 && (
              <button
                type="button"
                className="btn-ghost sm"
                style={{ marginTop: 8 }}
                onClick={addMatRow}
              >
                + Add Material
              </button>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving || uploading}>
              {saving ? "Saving…" : uploading ? "Uploading…" : item ? "Save Changes" : "Add Flower"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}