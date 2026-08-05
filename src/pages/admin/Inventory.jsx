import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './AdminTable.css';

const emptyForm = { name: '', category_id: '', price: '', description: '', in_stock: true, image_url: '' };

export default function Inventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [existingMediaIds, setExistingMediaIds] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/api/products'), api.get('/api/categories')])
      .then(([p, c]) => {
        setProducts(p.data);
        setCategories(c.data);
      })
      .catch(() => setError('Could not load inventory.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const openAdd = () => {
    setEditingId(null);
    setExistingMediaIds([]);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = async (product) => {
    setEditingId(product.id);
    setError('');
    setModalOpen(true);
    // The list endpoint includes media too, but re-fetch the single product
    // to be safe/current, and to get media ids we'd need for replacing it.
    try {
      const res = await api.get(`/api/products/${product.id}`);
      const detail = res.data;
      setExistingMediaIds((detail.media || []).map((m) => m.id));
      setForm({
        name: detail.name,
        category_id: detail.category_id,
        price: detail.price,
        description: detail.description || '',
        in_stock: !!detail.in_stock,
        image_url: detail.media?.[0]?.url || '',
      });
    } catch {
      // Fall back to the row data we already had if the detail fetch fails.
      setExistingMediaIds((product.media || []).map((m) => m.id));
      setForm({
        name: product.name,
        category_id: product.category_id,
        price: product.price,
        description: product.description || '',
        in_stock: !!product.in_stock,
        image_url: product.media?.[0]?.url || '',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      category_id: Number(form.category_id),
      managed_by: user.id,
      name: form.name,
      description: form.description,
      price: Number(form.price),
      in_stock: form.in_stock,
    };
    try {
      let productId = editingId;
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload, { auth: true });
      } else {
        const created = await api.post('/api/products', payload, { auth: true });
        productId = created.data.id;
      }

      // Replace the image: remove any old media rows, add the new URL if provided.
      await Promise.all(existingMediaIds.map((id) => api.delete(`/api/product-media/${id}`, { auth: true })));
      if (form.image_url.trim()) {
        await api.post(
          '/api/product-media',
          { product_id: productId, url: form.image_url.trim(), type: 'image' },
          { auth: true }
        );
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/api/products/${id}`, { auth: true });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="section-heading-row">
        <div>
          <h1 className="page-title">Stock management</h1>
          <p className="page-subtitle">Monitor and manage your product catalog.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add product
        </button>
      </div>

      <div className="card admin-table-card">
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products yet — add your first one.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.media?.[0]?.url ? (
                      <img
                        src={p.media[0].url}
                        alt={p.name}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }}
                      />
                    ) : (
                      <span style={{ opacity: 0.4 }}>—</span>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category_name || '—'}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>
                    <span className={`tag ${p.in_stock ? 'tag-fresh' : 'tag-alert'}`}>
                      {p.in_stock ? 'In stock' : 'Out of stock'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="icon-btn" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDelete(p.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="admin-form-modal-backdrop" onClick={() => setModalOpen(false)}>
          <form
            className="admin-form-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSave}
          >
            <h2>{editingId ? 'Edit product' : 'Add product'}</h2>

            {error && <p className="error-text">{error}</p>}

            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" required value={form.name} onChange={handleChange} />
            </div>

            <div className="form-field">
              <label htmlFor="category_id">Category</label>
              <select
                id="category_id"
                name="category_id"
                required
                value={form.category_id}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="price">Price ($)</label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="image_url">Image URL</label>
              <input
                id="image_url"
                name="image_url"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={form.image_url}
                onChange={handleChange}
              />
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Preview"
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
                  onError={(e) => (e.target.style.display = 'none')}
                />
              )}
            </div>

            <div className="form-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <label className="planner-market-item" style={{ marginBottom: 20 }}>
              <input
                type="checkbox"
                name="in_stock"
                checked={form.in_stock}
                onChange={handleChange}
              />
              <span>In stock</span>
            </label>

            <div className="admin-form-modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
