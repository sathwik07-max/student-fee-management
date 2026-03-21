import React, { useState, useEffect } from "react";
import { fetchClassrooms, promoteClass } from "../api";

export default function BulkPromotion({ showNotification }) {
  const [classes, setClasses] = useState([]);
  const [fromClassId, setFromClassId] = useState("");
  const [toClassId, setToClassId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClassrooms().then(setClasses);
  }, []);

  const handlePromote = async () => {
    if (!fromClassId || !toClassId) {
      showNotification("⚠️ Please select both classes", "error");
      return;
    }

    if (fromClassId === toClassId) {
      showNotification("⚠️ Source and target classes cannot be the same", "error");
      return;
    }

    if (!window.confirm("ARE YOU SURE? This will move all students in the selected class to the new grade!")) return;

    setLoading(true);
    try {
      const res = await promoteClass({
        from_class_id: fromClassId,
        to_class_id: toClassId
      });
      if (res.success) {
        showNotification(`🎉 Success! Moved ${res.count} students to the new class.`, "success");
        setFromClassId("");
        setToClassId("");
      } else {
        showNotification("❌ Promotion failed: " + res.error, "error");
      }
    } catch (err) {
      showNotification("❌ A system error occurred during promotion", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="promo-container-branded">
      <div className="promo-card-premium">
        <div className="promo-header-lockup">
           <div className="icon-badge">🚀</div>
           <div className="text-wrap">
             <h3>Bulk Academic Promotion</h3>
             <p>Instantly transition students between grade levels</p>
           </div>
        </div>

        <div className="promo-flow-box">
          <div className="flow-step">
            <label>SOURCE CLASS</label>
            <div className="select-wrapper">
              <select value={fromClassId} onChange={e => setFromClassId(e.target.value)}>
                <option value="">Select current grade</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flow-arrow">➜</div>

          <div className="flow-step">
            <label>TARGET CLASS</label>
            <div className="select-wrapper">
              <select value={toClassId} onChange={e => setToClassId(e.target.value)}>
                <option value="">Select destination grade</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="promo-actions-branded">
            <button 
              className="btn-promo-execute" 
              onClick={handlePromote}
              disabled={loading}
            >
              {loading ? "PROCESSING MIGRATION..." : "EXECUTE BULK PROMOTION"}
            </button>
            <p className="helper-text">This action will be logged for audit purposes.</p>
        </div>

        <div className="promo-alert-box">
          <strong>⚠️ SYSTEM ADVISORY:</strong> This tool modifies active enrollment records. Please verify the target class capacity before execution.
        </div>
      </div>
    </div>
  );
}
