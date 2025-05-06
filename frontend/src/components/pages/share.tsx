import { useState } from "react";

const SharePlanModal = ({ isOpen, onClose, scenario }) => {
  const [sharedUsers, setSharedUsers] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [newAccess, setNewAccess] = useState("edit");

  const fetchSharedUsers = async () => {
    const res = await fetch(`http://localhost:5000/api/users/shared-with/${scenario.id}`);
    const result = await res.json();
    setSharedUsers(result.data || []);
  };

  const handleShare = async () => {
    const currentUserEmail = localStorage.getItem("username");
    if (newEmail.toLowerCase() === currentUserEmail?.toLowerCase()) {
      alert("You cannot share a plan with yourself.");
      return;
    }

    const res = await fetch(`http://localhost:5000/api/users/share-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: newEmail,
        planId: scenario.id,
        access: newAccess,
      }),
    });

    if (res.ok) {
      alert(`Plan shared with ${newEmail}`);
      fetchSharedUsers();
      setNewEmail("");
    } else {
      alert("Failed to share plan.");
    }
  };

  const handleRemove = async (email) => {
    await fetch(`http://localhost:5000/api/users/stop-sharing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, planId: scenario.id }),
    });
    alert(`Stopped sharing with ${email}`);
    fetchSharedUsers();
  };

  const handleAccessChange = async (email, currentAccess) => {
    const newAccess = currentAccess === "edit" ? "view" : "edit";
    await fetch(`http://localhost:5000/api/users/change-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, planId: scenario.id, access: newAccess }),
    });
    alert(`Changed access for ${email} to ${newAccess}`);
    fetchSharedUsers();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Share Plan: {scenario.title}</h3>

        <h4>Shared With:</h4>
        <ul>
          {sharedUsers.map((user) => (
            <li key={user.email}>
              {user.email} — {user.access || "edit"}
              <button onClick={() => handleAccessChange(user.email, user.access || "edit")}>
                Toggle Access
              </button>
              <button onClick={() => handleRemove(user.email)}>Remove</button>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: "1em" }}>
          <h4>Share with New User:</h4>
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <select value={newAccess} onChange={(e) => setNewAccess(e.target.value)}>
            <option value="edit">Edit</option>
            <option value="view">View Only</option>
          </select>
          <button onClick={handleShare}>Share</button>
        </div>

        <button onClick={onClose} style={{ marginTop: "1em" }}>Close</button>
      </div>
    </div>
  );
};
export default SharePlanModal;