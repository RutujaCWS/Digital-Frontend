import { useState } from 'react';
import { Button, Form, Spinner, Image } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ImageUpload({ value, onChange, label = 'Image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large (max 5MB)');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Only images allowed');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await axios.post(
        'https://digital-backend-phi.vercel.app/api/upload/image',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      onChange(data.url);   // Pass URL back to parent
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <Form.Group>
      <Form.Label>{label}</Form.Label>

      {value ? (
        <div className="border rounded p-3 text-center">
          <Image
            src={value}
            alt="Uploaded"
            style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain' }}
            className="mb-2"
          />
          <div className="d-flex gap-2 justify-content-center">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => document.getElementById('file-input-' + label).click()}
              disabled={uploading}
            >
              🔄 Change
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
            >
              ❌ Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border border-2 border-dashed rounded p-4 text-center"
          style={{ cursor: 'pointer', background: '#fafafa' }}
          onClick={() => document.getElementById('file-input-' + label).click()}
        >
          {uploading ? (
            <>
              <Spinner animation="border" size="sm" /> Uploading...
            </>
          ) : (
            <>
              <div style={{ fontSize: '2rem' }}>📸</div>
              <div className="text-muted small mt-2">
                Click to upload image
              </div>
              <div className="text-muted small">PNG, JPG, WEBP (max 5MB)</div>
            </>
          )}
        </div>
      )}

      <input
        id={'file-input-' + label}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={uploading}
      />

      {error && <div className="text-danger small mt-1">{error}</div>}
    </Form.Group>
  );
}