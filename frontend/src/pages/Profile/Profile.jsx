import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const addToast = useToast();
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    phone: "",
    bio: "",
    timezone: "Asia/Kolkata",
    profile_photo: "",
  });
  
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await api.get("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile({
        name: response.data.name || "",
        email: response.data.email || "",
        company: response.data.company || "",
        role: response.data.role || "",
        phone: response.data.phone || "",
        bio: response.data.bio || "",
        timezone: response.data.timezone || "Asia/Kolkata",
        profile_photo: response.data.profile_photo || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      addToast("Failed to load profile.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await api.get("/api/documents", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await api.put("/api/users/profile", {
        name: profile.name,
        company: profile.company,
        role: profile.role,
        phone: profile.phone,
        bio: profile.bio,
        timezone: profile.timezone,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.user.name) {
        localStorage.setItem("userName", response.data.user.name);
      }
      
      addToast("Profile updated successfully!", "success");
      window.dispatchEvent(new Event("profileUpdated"));

    } catch (error) {
      console.error("Error updating profile:", error);
      addToast("Failed to update profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Please select an image file.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast("Image size exceeds 5MB limit.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    addToast("Uploading photo...", "info");

    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/api/users/profile/photo", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      
      setProfile(prev => ({ ...prev, profile_photo: response.data.profile_photo }));
      localStorage.setItem("profilePhoto", response.data.profile_photo);
      addToast("Profile photo updated!", "success");
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (error) {
      console.error("Error uploading photo:", error);
      addToast("Failed to upload photo.", "error");
    } finally {
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete("/api/users/profile/photo", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(prev => ({ ...prev, profile_photo: "" }));
      localStorage.removeItem("profilePhoto");
      addToast("Profile photo removed!", "success");
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (error) {
      console.error("Error removing photo:", error);
      addToast("Failed to remove photo.", "error");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast("File size exceeds 10MB limit.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    addToast("Uploading document...", "info");

    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/api/documents/upload", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      
      addToast(response.data.message || "Document uploaded successfully!", "success");
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error("Error uploading document:", error);
      addToast("Failed to upload document.", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast("Document deleted successfully.", "success");
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      addToast("Failed to delete document.", "error");
    }
  };

  const handleDownloadDocument = async (id, filename) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/api/documents/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading document:", error);
      addToast("Failed to download document.", "error");
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
       // Mock the event object structure to reuse handleFileChange
       handleFileChange({ target: { files: [files[0]] } });
    }
  };

  if (isLoading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>View and manage your account details.</p>
      </div>

      <div className="profile-content">
        <form onSubmit={handleSave} className="profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="disabled-input"
              title="Email cannot be changed"
            />
            <small>Email is used for sign-in and cannot be changed.</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                value={profile.company}
                onChange={(e) => setProfile({...profile, company: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) => setProfile({...profile, role: e.target.value})}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Timezone</label>
              <select 
                value={profile.timezone}
                onChange={(e) => setProfile({...profile, timezone: e.target.value})}
                className="custom-select"
              >
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Bio / About Me</label>
            <textarea
              rows="3"
              placeholder="Write a short bio about yourself..."
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              className="custom-textarea"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSaving} className="save-button">
              {isSaving ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </form>

        <div className="profile-sidebar">
          <div className="profile-card mb-6">
            <div className="profile-avatar-container" onClick={() => photoInputRef.current?.click()}>
              <div className="profile-avatar">
                {profile.profile_photo ? (
                  <img src={`http://localhost:8000${profile.profile_photo}`} alt="Profile" className="profile-photo-img" />
                ) : (
                  profile.name ? profile.name.substring(0, 2).toUpperCase() : "ME"
                )}
              </div>
              <div className="profile-avatar-overlay">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <input 
              type="file" 
              ref={photoInputRef} 
              style={{ display: "none" }} 
              onChange={handleProfilePhotoChange}
              accept="image/*"
            />
            {profile.profile_photo && (
              <button 
                type="button" 
                onClick={handleRemovePhoto}
                style={{
                  marginTop: "12px",
                  padding: "6px 12px",
                  fontSize: "13px",
                  color: "#ef4444",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                  marginBottom: "8px"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Remove Photo
              </button>
            )}
            <h2>{profile.name}</h2>
            <p className="profile-role">{profile.role || "No Role Set"}</p>
            <p className="profile-company">{profile.company || "No Company Set"}</p>
          </div>

          <div className="documents-card">
            <div className="documents-header">
              <h3>My Documents</h3>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: "none" }} 
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <button type="button" className="upload-btn" onClick={triggerUpload} disabled={isUploading}>
                {isUploading ? (
                   <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                  </svg>
                )}
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
            <p className="documents-subtext">Manage your NDAs, contracts, and certificates.</p>
            
            <div className="documents-list">
              {documents.length === 0 && <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>No documents uploaded yet.</p>}
              {documents.map((doc) => (
                <div key={doc.id} className="document-item">
                  <div className="doc-icon">
                    <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div className="doc-info">
                    <div className="doc-name">{doc.name}</div>
                    <div className="doc-meta">{doc.size} • Uploaded {doc.date}</div>
                  </div>
                  <button type="button" className="doc-action" title="Download" onClick={() => handleDownloadDocument(doc.id, doc.name)}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                  </button>
                  <button type="button" className="doc-action" title="Delete" onClick={() => handleDeleteDocument(doc.id)} style={{ color: "#ef4444" }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="upload-zone" onClick={triggerUpload} onDragOver={handleDragOver} onDrop={handleDrop}>
              <svg width="24" height="24" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24" className="mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <p>Drag & drop files here or Click</p>
              <small>PDF, JPG, PNG up to 10MB</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
