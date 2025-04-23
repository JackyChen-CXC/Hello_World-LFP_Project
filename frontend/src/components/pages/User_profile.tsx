import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css_files/page_style.css";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
}

const UserProfile = () => {
  // Retrieve user data
  const username = localStorage.getItem("name") || "User";
  const email = localStorage.getItem("username");
  const picture = localStorage.getItem("picture");
  const userId = localStorage.getItem("userId") || "";
  const navigate = useNavigate();
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to fetch files uploaded by the user
  const fetchUploadedFiles = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:5000/api/user-files?userId=${userId}`);
      const result = await response.json();
      if (response.ok) {
        setUploadedFiles(result.data);
      } else {
        console.error("Failed to fetch user files:", result.error);
      }
    } catch (error) {
      console.error("Error fetching user files:", error);
    }
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  // Handler for file selection (does not upload immediately)
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate that only YAML files are allowed
    const allowedTypes = [".yaml"];
    const fileExt = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      alert("Only YAML files can be uploaded");
      return;
    }
    setSelectedFile(file);
  };

  // Handler to trigger hidden file input on button click
  const handleChooseFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Upload file when user clicks the upload button
  const uploadUserFile = async () => {
    if (!selectedFile || !userId) {
      alert("Missing file or user ID");
      return;
    }
    
    const formData = new FormData();
    // Important: append userId first
    formData.append("userId", userId);
    formData.append("userFile", selectedFile);
    
    try {
      const response = await fetch("http://localhost:5000/api/upload-user-file", {
        method: "POST",
        headers: {
          // Remove Content-Type header to let the browser set it with the boundary
        },
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        console.log("File uploaded successfully", result);
        alert("File uploaded successfully");
        setSelectedFile(null);
        // Reset file input using the ref
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        fetchUploadedFiles();
      } else {
        console.error("Upload failed:", result.error);
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    }
  };

  // Delete a file by its id
  const deleteFile = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/delete-user-file/${id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      const result = await response.json();
      if (response.ok) {
        alert("File deleted successfully");
        fetchUploadedFiles();
      } else {
        alert(`Delete failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Logout?")) {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <div className="page-container">
      <div className="header">
        <div>User Profile</div>
      </div>

      <div className="profile-container" style={{ textAlign: "center", marginTop: "40px" }}>
        <img
          src={picture || ""}
          height={220}
          width={220}
          alt="User Profile"
          style={{ borderRadius: "50%" }}
        />
        <h2>{username}</h2>
        <p>{email}</p>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {/* Upload Section */}
      <div className="upload-container" style={{ marginTop: "20px", textAlign: "center" }}>
        <div className="normal-text">Upload your tax files here</div>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          name="userFile"
          style={{ display: "none" }}
          onChange={handleFileSelection}
        />
        {/* Custom Choose File Button */}
        
          <button 
            onClick={handleChooseFile}
            className="custom-btn"
          >
            Choose File
          </button>
        {selectedFile && (
          <div>
            <p style={{color : "red"}}>Selected file: {selectedFile.name}</p>
            {/* Upload button */}
            <button 
              onClick={uploadUserFile}
              className="custom-btn"
            >
              Upload Selected File
            </button>
          </div>
        )}
      </div>

      {/* List of Uploaded Files */}
      <div className="uploaded-files-container" style={{ marginTop: "20px", textAlign: "center" }}>
        <h3>Uploaded Files</h3>
        {uploadedFiles.length > 0 ? (
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {uploadedFiles.map((file) => (
              <li key={file.id} style={{ marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ marginRight: "10px" }}>{file.name}</span>
                <img
                  src="/images/trash.png"
                  alt="Delete"
                  style={{ cursor: "pointer", width: "30px", height: "30px" }}
                  onClick={() => deleteFile(file.id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p>No files uploaded.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
