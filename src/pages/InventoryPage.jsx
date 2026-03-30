import { useState, useEffect, useRef } from "react";
import {
  collection, addDoc, getDocs, updateDoc,
  deleteDoc, doc, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import FuzzyWireTab from "../components/FuzzyWireTab";
import MaterialsTab from "../components/MaterialsTab";
import "../styles/Inventory.css";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("fuzzywire");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2800);
  };

  const fetchItems = async (category) => {
    setLoading(true);
    const q = query(
      collection(db, category === "fuzzywire" ? "fuzzy_wire" : "materials"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setItems([]);
  };

  return (
    <div className="inventory-page">

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Inventory</h1>
        <p className="page-sub">Manage your stock and materials</p>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === "fuzzywire" ? "active" : ""}`}
          onClick={() => handleTabSwitch("fuzzywire")}
        >
          🧶 Fuzzy Wire
        </button>
        <button
          className={`tab-btn ${activeTab === "materials" ? "active" : ""}`}
          onClick={() => handleTabSwitch("materials")}
        >
          🪣 Materials
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "fuzzywire" && (
        <FuzzyWireTab
          items={items}
          loading={loading}
          onRefresh={() => fetchItems("fuzzywire")}
          showToast={showToast}
        />
      )}
      {activeTab === "materials" && (
        <MaterialsTab
          items={items}
          loading={loading}
          onRefresh={() => fetchItems("materials")}
          showToast={showToast}
        />
      )}

      {/* Toast */}
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}