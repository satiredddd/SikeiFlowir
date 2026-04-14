import FlowersTab from "../components/FlowersTab";

export default function FlowersPage({ showToast }) {
  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1 className="page-title">Flowers</h1>
        <p className="page-sub">Manage your flower designs and recipes</p>
      </div>
      <FlowersTab showToast={showToast} />
    </div>
  );
}