import { useState, useEffect } from "react";
import {
  doc, getDoc, setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import "../styles/FuzzyWire.css";

export default function FuzzyWireTab({ showToast }) {
  const [bundlePrice, setBundlePrice] = useState("");
  const [bundleSize,  setBundleSize]  = useState("100");
  const [savingCost,  setSavingCost]  = useState(false);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "settings", "fuzzy_wire_cost"));
      if (snap.exists()) {
        setBundlePrice(snap.data().bundlePrice ?? "");
        setBundleSize(snap.data().bundleSize  ?? "100");
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSavingCost(true);
    await setDoc(doc(db, "settings", "fuzzy_wire_cost"), {
      bundlePrice: parseFloat(bundlePrice) || 0,
      bundleSize:  parseInt(bundleSize)    || 100,
    });
    setSavingCost(false);
    showToast("💾 Fuzzy wire cost saved!");
  };

  const pricePerPiece = bundlePrice && bundleSize
    ? parseFloat(bundlePrice) / parseInt(bundleSize)
    : 0;

  return (
    <div className="tab-content">
      <div className="pricing-card">
        <div className="pricing-card-header">
          <span className="pricing-icon">🧶</span>
          <div>
            <h3 className="pricing-title">Fuzzy Wire</h3>
            <p className="pricing-sub">Set your bundle price to compute cost per piece</p>
          </div>
        </div>

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
            <label>Pcs per Bundle</label>
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
            onClick={handleSave}
            disabled={savingCost}
          >
            {savingCost ? "Saving…" : "Save"}
          </button>
        </div>

        {pricePerPiece > 0 && (
          <div className="per-piece-result">
            <span className="per-piece-label">Cost per piece</span>
            <span className="per-piece-value">₱{pricePerPiece.toFixed(4)}</span>
          </div>
        )}
      </div>
    </div>
  );
}