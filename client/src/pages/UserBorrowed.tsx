import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Table, Button, Form, Alert, Badge } from 'react-bootstrap';

interface Book {
  id: string;
  title: string;
  author: { name: string };
}

interface BorrowRecord {
  id: string;
  book: Book;
  borrowedAt: string;
  returnedAt?: string;
}

export default function UserBorrowed() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);

  useEffect(() => {
    if (id) loadBorrowed();
  }, [id, activeOnly]);

  const loadBorrowed = async () => {
    if (!id) {
      setError('User ID is missing');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/users/${id}/borrowed`, { params: { active: activeOnly } });
      console.log('Borrowed books response:', res.data);
      setRecords(res.data || []);
    } catch (err: any) {
      console.error('Failed to load borrowed books', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load borrowed books';
      setError(errorMessage);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (recordId: string) => {
    try {
      await api.post(`/borrow/${recordId}/return`);
      loadBorrowed();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to return book');
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/users')}>
          <i className="bi bi-arrow-left"></i> Back to Users
        </Button>
        <h1 className="mb-0">Borrowed Books</h1>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-4">
        <Form.Check
          type="switch"
          id="active-only-switch"
          label="Show only active borrows"
          checked={activeOnly}
          onChange={(e) => setActiveOnly(e.target.checked)}
        />
      </Form.Group>

      <div className="table-responsive shadow-sm rounded">
        <Table hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th>Book</th>
              <th>Author</th>
              <th>Borrowed At</th>
              <th>Returned At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td className="fw-bold">{record.book?.title || 'N/A'}</td>
                <td>{record.book?.author?.name || 'N/A'}</td>
                <td>{record.borrowedAt ? new Date(record.borrowedAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                  {record.returnedAt ? (
                    <span className="text-muted">{new Date(record.returnedAt).toLocaleDateString()}</span>
                  ) : (
                    <Badge bg="warning" text="dark">Active</Badge>
                  )}
                </td>
                <td>
                  {!record.returnedAt && (
                    <Button variant="success" size="sm" onClick={() => handleReturn(record.id)}>Return</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {!loading && records.length === 0 && (
        <Alert variant="info" className="mt-4">
          No borrowed books found for this user.
        </Alert>
      )}
    </div>
  );
}
