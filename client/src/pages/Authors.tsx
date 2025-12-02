import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';

interface Author {
  id: string;
  name: string;
  bio?: string;
}

export default function Authors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState({ name: '', bio: '' });

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/authors');
      setAuthors(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name: formData.name, bio: formData.bio || undefined };
      if (editingAuthor) {
        await api.patch(`/authors/${editingAuthor.id}`, payload);
      } else {
        await api.post('/authors', payload);
      }
      resetForm();
      loadAuthors();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save author');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this author?')) return;
    try {
      await api.delete(`/authors/${id}`);
      loadAuthors();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete author');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', bio: '' });
    setEditingAuthor(null);
    setShowForm(false);
  };

  const resetFormData = () => {
    setFormData({ name: '', bio: '' });
    setEditingAuthor(null);
  };

  const startEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({ name: author.name, bio: author.bio || '' });
    setShowForm(true);
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Authors</h1>
        <Button variant="primary" onClick={() => { resetFormData(); setShowForm(true); }}>
          <i className="bi bi-plus-lg"></i> Add Author
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Modal show={showForm} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editingAuthor ? 'Edit' : 'Add'} Author</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={resetForm}>Cancel</Button>
              <Button variant="primary" type="submit">Save</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <div className="table-responsive shadow-sm rounded">
        <Table hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th>Name</th>
              <th>Bio</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id}>
                <td className="fw-bold">{author.name}</td>
                <td>{author.bio || <span className="text-muted">-</span>}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => startEdit(author)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(author.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
