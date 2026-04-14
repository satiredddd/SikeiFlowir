import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/FuzzyWire.css";

export default function OrderSettingsTab({ showToast }) {
  const [small,  setSmall]  = useState("");
  const [medium, setMedium] = useState("");
  const [large,  setLarge]  = useState("");
  const [rush,   setRush]   = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "settings", "order_pricing"));
      if (snap.exists()) {
        const d = snap.data();
        setSmall(d.small   ?? "");
        setMedium(d.medium ?? "");
        setLarge(d.large   ?? "");
        setRush(d.rush     ?? "");
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await setDoc(doc(db, "settings", "order_pricing"), {
      small:  parseFloat(small)  || 0,
      medium: parseFloat(medium) || 0,
      large:  parseFloat(large)  || 0,
      rush:   parseFloat(rush)   || 0,
    });
    setSaving(false);
    showToast("💾 Order pricing saved!");
  };

  return (
    <div className="tab-content">
      <div className="pricing-card">
        <div className="pricing-card-header">
          <span className="pricing-icon">⚙️</span>
          <div>
            <h3 className="pricing-title">Order Pricing Settings</h3>
            <p className="pricing-sub">Extra cost added on top of each flower's selling price</p>
          </div>
        </div>

        <div className="settings-grid">
          <div className="field-group">
            <label>Small — Extra Cost (₱)</label>
            <input
              type="number"
              value={small}
              onChange={(e) => setSmall(e.target.value)}
              placeholder="e.g. 0"
              min="0"
              step="0.01"
            />
          </div>
          <div className="field-group">
            <label>Medium — Extra Cost (₱)</label>
            <input
              type="number"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="e.g. 20"
              min="0"
              step="0.01"
            />
          </div>
          <div className="field-group">
            <label>Large — Extra Cost (₱)</label>
            <input
              type="number"
              value={large}
              onChange={(e) => setLarge(e.target.value)}
              placeholder="e.g. 50"
              min="0"
              step="0.01"
            />
          </div>
          <div className="field-group">
            <label>Rush Order — Extra Cost (₱)</label>
            <input
              type="number"
              value={rush}
              onChange={(e) => setRush(e.target.value)}
              placeholder="e.g. 100"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ marginTop: 20, width: "100%" }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Pricing"}
        </button>
      </div>
    </div>
  );
}