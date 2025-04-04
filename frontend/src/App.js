import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  // API configuration
  const API_URL = 'http://localhost:3001/api';

  // Load images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Generate preview when file is selected
  useEffect(() => {
    if (!selectedFile) {
      setPreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // Fetch all images from backend
  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_URL}/images`);
      setImages(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load images. Please try again later.');
      console.error('Fetch error:', err);
    }
  };

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Refresh the image list
      await fetchImages();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size too large (max 5MB)');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  return (
    <div className="app-container">
      <header>
        <h1>Image Upload Gallery</h1>
        <p>Upload and manage your images</p>
      </header>

      <div className="upload-section">
        <form onSubmit={handleUpload}>
          <div className="file-input-container">
            <label htmlFor="file-upload" className="file-upload-label">
              {selectedFile ? 'Change Image' : 'Select Image'}
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="file-input"
              />
            </label>
            {selectedFile && (
              <span className="file-name">{selectedFile.name}</span>
            )}
          </div>

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="upload-button"
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                Uploading...
              </>
            ) : (
              'Upload Image'
            )}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="gallery-container">
        <h2>Your Images</h2>
        {images.length === 0 ? (
          <p className="empty-gallery">No images uploaded yet</p>
        ) : (
        // Update only the image rendering part:
<div className="image-grid">
  {images.map((image) => (
    <div key={image._id} className="image-card">
      <img
        src={`http://localhost:3001/uploads/${image.filename}`}
        alt={image.originalname}
        onError={(e) => {
          e.target.src = '/placeholder.jpg';
          e.target.style.border = '2px dashed #ccc';
          e.target.alt = 'Failed to load image';
        }}
        style={{ 
          maxHeight: '200px',
          width: '100%',
          objectFit: 'cover'
        }}
      />
      <div className="image-info">
        <span className="image-name">{image.originalname}</span>
        <span className="image-date">
          {new Date(image.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  ))}
</div>
        )}
      </div>
    </div>
  );
}

export default App;