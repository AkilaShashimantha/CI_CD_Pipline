import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const API_BASE_URL = 'http://localhost:3001';

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const fetchImages = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/images`);
      setImages(data.images || []);
      setError('');
    } catch (err) {
      setError('Failed to load images. Please try again later.');
      console.error('Fetch error:', err);
    }
  };

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

      await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchImages();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image/(jpeg|png|gif|webp)')) {
      setError('Only JPG, PNG, GIF, or WEBP images are allowed');
      return;
    }

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
                accept="image/jpeg, image/png, image/gif, image/webp"
              />
            </label>
            {selectedFile && (
              <span className="file-name">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </span>
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
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="gallery-container">
        <h2>Your Images ({images.length})</h2>
        {images.length === 0 ? (
          <p>No images uploaded yet</p>
        ) : (
          <div className="image-grid">
            {images.map((image) => (
              <div key={image.id} className="image-card">
                <img
                  src={image.url}
                  alt={image.name}
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg';
                  }}
                />
                <div className="image-info">
                  <span>{image.name}</span>
                  <span>{(image.size / 1024).toFixed(2)} KB</span>
                  <span>{new Date(image.uploadedAt).toLocaleString()}</span>
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