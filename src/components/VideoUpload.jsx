import { useState, useRef } from 'react';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function VideoUpload({ value, onChange, label = 'Video', height = 200 }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { token } = useAuth();

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError('File too large (max 50MB)');
      return;
    }
    if (!file.type.startsWith('video/')) {
      setError('Only video files allowed');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const { data } = await axios.post(
        'https://digitalworldkopargaonbackend.vercel.app/api/upload/video',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        }
      );

      onChange(data.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => onChange('');
  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <Form.Group>
      <Form.Label className="fw-semibold">{label}</Form.Label>

      {value ? (
        <div className="border rounded-3 p-3 text-center" style={{ background: '#f8f9fa' }}>
          <video
            src={value}
            controls
            style={{
              maxHeight: `${height}px`,
              maxWidth: '100%',
              borderRadius: '8px',
              display: 'block',
              margin: '0 auto 12px'
            }}
          />
          <div className="d-flex gap-2 justify-content-center">
            <Button variant="primary" size="sm" onClick={triggerUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Uploading...
                </>
              ) : (
                <>🔄 Change Video</>
              )}
            </Button>
            <Button variant="outline-danger" size="sm" onClick={handleRemove} disabled={uploading}>
              ❌ Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border border-2 border-dashed rounded-3 p-4 text-center"
          style={{
            cursor: uploading ? 'not-allowed' : 'pointer',
            background: uploading ? '#f0f0f0' : '#fafafa',
            minHeight: `${height}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            borderColor: '#cbd5e1'
          }}
          onClick={!uploading ? triggerUpload : undefined}
          onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.borderColor = '#dc2626'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
        >
          {uploading ? (
            <>
              <Spinner animation="border" variant="danger" />
              <div className="mt-3 text-muted small">Uploading... {progress}%</div>
              <div style={{ width: '200px', height: '6px', background: '#e5e7eb', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #dc2626, #f59e0b)', transition: 'width 0.3s' }} />
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '3rem', lineHeight: 1 }}>🎥</div>
              <div className="fw-semibold mt-2">Click to Upload Video</div>
              <div className="text-muted small mt-1">MP4, MOV, AVI, WEBM · Max 50MB</div>
              <Button variant="outline-danger" size="sm" className="mt-3" disabled={uploading}>
                Choose Video File
              </Button>
            </>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileSelect} />

      {error && <Alert variant="danger" className="mt-2 py-2 mb-0 small">⚠️ {error}</Alert>}
    </Form.Group>
  );
}