import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Table, Button, Modal, Form, Alert, Row, Col, Badge } from 'react-bootstrap';

interface Author {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Book {
  id: string;
  title: string;
  description?: string;
  publishedYear?: number;
  author: Author;
  borrowRecords?: Array<{ id: string }>;
  isBorrowed?: boolean;
  currentBorrowRecordId?: string;
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterAuthorId, setFilterAuthorId] = useState('');
  const [filterBorrowed, setFilterBorrowed] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    authorId: '',
    publishedYear: '',
  });

  useEffect(() => {
    loadAuthors();
    loadUsers();
    loadBooks();
  }, [filterAuthorId, filterBorrowed]);

  const loadAuthors = async () => {
    try {
      const res = await api.get('/authors');
      setAuthors(res.data);
    } catch (err) {
      console.error('Failed to load authors', err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
      if (res.data && res.data.length === 0) {
        console.log('No users found in database. Create users via the Users page.');
      }
    } catch (err: any) {
      console.error('Failed to load users', err);
      if (err.response?.status === 401) {
        console.error('Authentication required. Please login again.');
      } else {
        console.error('Error loading users:', err.response?.data?.message || err.message);
      }
      setUsers([]);
    }
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterAuthorId) params.authorId = filterAuthorId;
      if (filterBorrowed === 'true') params.isBorrowed = 'true';
      if (filterBorrowed === 'false') params.isBorrowed = 'false';
      const res = await api.get('/books', { params });
      // Transform response to include isBorrowed flag and current record ID
      const booksWithStatus = res.data.map((book: any) => ({
        ...book,
        isBorrowed: book.borrowRecords && book.borrowRecords.length > 0,
        currentBorrowRecordId: book.borrowRecords?.[0]?.id,
      }));
      setBooks(booksWithStatus);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        authorId: formData.authorId,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : undefined,
      };
      if (editingBook) {
        await api.patch(`/books/${editingBook.id}`, payload);
      } else {
        await api.post('/books', payload);
      }
      resetForm();
      loadBooks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save book');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this book?')) return;
    try {
      await api.delete(`/books/${id}`);
      loadBooks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const openBorrowModal = (bookId: string) => {
    setSelectedBookId(bookId);
    setSelectedUserId('');
    setShowBorrowModal(true);
  };

  const handleBorrow = async () => {
    if (!selectedBookId || !selectedUserId) {
      alert('Please select a user');
      return;
    }
    try {
      await api.post('/borrow', { userId: selectedUserId, bookId: selectedBookId });
      setShowBorrowModal(false);
      setSelectedBookId(null);
      setSelectedUserId('');
      loadBooks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to borrow book');
    }
  };

  const handleReturn = async (recordId: string) => {
    try {
      await api.post(`/borrow/${recordId}/return`);
      loadBooks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to return book');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', authorId: '', publishedYear: '' });
    setEditingBook(null);
    setShowForm(false);
  };

  const resetFormData = () => {
    setFormData({ title: '', description: '', authorId: '', publishedYear: '' });
    setEditingBook(null);
  };

  const startEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      description: book.description || '',
      authorId: book.author.id,
      publishedYear: book.publishedYear?.toString() || '',
    });
    setShowForm(true);
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Books</h1>
        <Button variant="primary" onClick={() => { resetFormData(); setShowForm(true); }}>
          <i className="bi bi-plus-lg"></i> Add Book
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4 g-3">
        <Col md={4}>
          <Form.Select
            value={filterAuthorId}
            onChange={(e) => setFilterAuthorId(e.target.value)}
          >
            <option value="">All Authors</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select
            value={filterBorrowed}
            onChange={(e) => setFilterBorrowed(e.target.value)}
          >
            <option value="">All Books</option>
            <option value="true">Borrowed</option>
            <option value="false">Available</option>
          </Form.Select>
        </Col>
      </Row>

      <Modal show={showForm} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editingBook ? 'Edit' : 'Add'} Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Author</Form.Label>
              <Form.Select
                value={formData.authorId}
                onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                required
              >
                <option value="">Select Author</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Published Year</Form.Label>
              <Form.Control
                type="number"
                value={formData.publishedYear}
                onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
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
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>
                  <div className="fw-bold">{book.title}</div>
                  <small className="text-muted">{book.publishedYear}</small>
                </td>
                <td>{book.author.name}</td>
                <td>
                  {book.isBorrowed ? (
                    <Badge bg="warning" text="dark">Borrowed</Badge>
                  ) : (
                    <Badge bg="success">Available</Badge>
                  )}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => startEdit(book)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(book.id)}>Delete</Button>
                    {book.isBorrowed ? (
                      <Button variant="warning" size="sm" onClick={() => handleReturn(book.currentBorrowRecordId!)}>Return</Button>
                    ) : (
                      <Button variant="success" size="sm" onClick={() => openBorrowModal(book.id)}>Borrow</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showBorrowModal} onHide={() => setShowBorrowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Borrow Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {users.length === 0 ? (
            <Alert variant="warning">
              No users found. Please create users first via the Users page.
              <div className="mt-2">
                <Button variant="outline-dark" size="sm" onClick={() => { setShowBorrowModal(false); loadUsers(); }}>
                  Reload Users
                </Button>
              </div>
            </Alert>
          ) : (
            <Form.Group>
              <Form.Label>Select User</Form.Label>
              <Form.Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBorrowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleBorrow} disabled={!selectedUserId || users.length === 0}>
            Borrow
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
