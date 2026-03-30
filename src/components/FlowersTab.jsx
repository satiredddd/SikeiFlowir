import { useState, useEffect } from "react";
import {
  collection, addDoc, updateDoc,
  deleteDoc, doc, getDocs, serverTimestamp, getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import FlowerModal from "./FlowerModal";
import ConfirmModal from "./ConfirmModal";
import "../styles/Flowers.css";

export default function FlowersTab({ showToast }) {
  const [flowers, setFlowers]           = useState([]);
  const [materials, setMaterials]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editItem, setEditItem]         = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [fuzzyPricePerPiece, setFuzzyPricePerPiece] = useState(0);

  const fetchAll = async () => {
    setLoading(true);

    const flowerSnap = await getDocs(collection(db, "flowers"));
    setFlowers(flowerSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

    const matSnap = await getDocs(collection(db, "materials"));
    setMaterials(matSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

    const costSnap = await getDoc(doc(db, "settings", "fuzzy_wire_cost"));
    if (costSnap.exists()) {
      const { bundlePrice, bundleSize } = costSnap.data();
      setFuzzyPricePerPiece(bundlePrice / bundleSize || 0);
    }

    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (data) => {
    await addDoc(collection(db, "flowers"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    await fetchAll();
    setShowModal(false);
    showToast("🌸 Flower added!");
  };

  const handleEdit = async (data) => {
    await updateDoc(doc(db, "flowers", editItem.id), data);
    await fetchAll();
    setEditItem(null);
    showToast("✏️ Flower updated!");
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "flowers", deleteTarget.id));
    await fetchAll();
    setDeleteTarget(null);
    showToast("🗑️ Flower deleted.");
  };

  const computeCost = (flower) => {
    const fuzzyCost = (flower.fuzzyCount || 0) * fuzzyPricePerPiece;
    const matCost = (flower.materials || []).reduce((sum, m) => {
      const found = materials.find((x) => x.id === m.materialId);
      if (!found) return sum;
      const perPiece = found.bundlePrice && found.bundleSize
        ? found.bundlePrice / found.bundleSize
        : 0;
      return sum + perPiece * (m.qty || 0);
    }, 0);
    return fuzzyCost + matCost;
  };

  return (
    <div className="tab-content">
      <div className="tab-toolbar">
        <span className="item-count">{flowers.length} flowers</span>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Flower
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : flowers.length === 0 ? (
        <div className="empty-state">No flowers yet. Add one!</div>
      ) : (
        <div className="flower-grid">
          {flowers.map((flower) => {
            const cost = computeCost(flower);
            return (
              <div className="flower-card" key={flower.id}>

                <div className="flower-img-wrap">
                  {flower.imageUrl ? (
                    <img src={flower.imageUrl} alt={flower.name} className="flower-img" />
                  ) : (
                    <div className="flower-img-placeholder">🌸</div>
                  )}
                </div>

                <div className="flower-body">
                  <h3 className="flower-name">{flower.name}</h3>

                  <div className="flower-recipe">
                    <div className="recipe-row">
                      <span className="recipe-icon">🧶</span>
                      <span className="recipe-label">Fuzzy Wire</span>
                      <span className="recipe-value">{flower.fuzzyCount || 0} pcs</span>
                    </div>

                    {(flower.materials || []).length > 0 && (
                      <div className="recipe-materials">
                        <span className="recipe-mat-title">Materials</span>
                        {flower.materials.map((m, i) => {
                          const found = materials.find((x) => x.id === m.materialId);
                          return (
                            <div className="recipe-row" key={i}>
                              <span className="recipe-icon">🪣</span>
                              <span className="recipe-label">{found?.name || "Unknown"}</span>
                              <span className="recipe-value">{m.qty} pcs</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flower-cost">
                    <span className="cost-label">Cost to make</span>
                    <span className="cost-amount">
                      ₱{cost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flower-actions">
                    <button className="btn-ghost sm" onClick={() => setEditItem(flower)}>✏️ Edit</button>
                    <button className="btn-danger-ghost sm" onClick={() => setDeleteTarget(flower)}>🗑️ Delete</button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <FlowerModal
          materials={materials}
          onClose={() => setShowModal(false)}
          onSave={handleAdd}
          showToast={showToast}
        />
      )}
      {editItem && (
        <FlowerModal
          item={editItem}
          materials={materials}
          onClose={() => setEditItem(null)}
          onSave={handleEdit}
          showToast={showToast}
        />
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