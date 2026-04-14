import { useState } from "react";
import FuzzyWireTab from "../components/FuzzyWireTab";
import WrapperTab from "../components/WrapperTab";
import MaterialsTab from "../components/MaterialsTab";
import OrderSettingsTab from "../components/OrderSettingsTab";
import "../styles/Inventory.css";

export default function InventoryPage({ showToast }) {
  const [activeTab, setActiveTab] = useState("fuzzywire");

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1 className="page-title">Price Computation</h1>
        <p className="page-sub">Manage your material costs and pricing</p>
      </div>

      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === "fuzzywire" ? "active" : ""}`}
          onClick={() => setActiveTab("fuzzywire")}
        >🧶 Fuzzy Wire</button>
        <button
          className={`tab-btn ${activeTab === "wrapper" ? "active" : ""}`}
          onClick={() => setActiveTab("wrapper")}
        >🎀 Wrapper</button>
        <button
          className={`tab-btn ${activeTab === "materials" ? "active" : ""}`}
          onClick={() => setActiveTab("materials")}
        >🪣 Materials</button>
        <button
          className={`tab-btn ${activeTab === "ordersettings" ? "active" : ""}`}
          onClick={() => setActiveTab("ordersettings")}
        >⚙️ Order Pricing</button>
      </div>

      {activeTab === "fuzzywire"     && <FuzzyWireTab     showToast={showToast} />}
      {activeTab === "wrapper"       && <WrapperTab       showToast={showToast} />}
      {activeTab === "materials"     && <MaterialsTab     showToast={showToast} />}
      {activeTab === "ordersettings" && <OrderSettingsTab showToast={showToast} />}
    </div>
  );
}