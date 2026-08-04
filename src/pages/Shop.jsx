import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import './Shop.css';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/api/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const query = categoryId ? `?category_id=${categoryId}` : '';
    api
      .get(`/api/products${query}`)
      .then((res) => setProducts(res.data))
      .catch(() => setError('Could not load products right now. Please try again shortly.'))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const visibleProducts = useMemo(() => {
    if (!search.trim()) return products;
    const term = search.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, search]);

  const selectCategory = (id) => {
    if (id) setSearchParams({ category: id });
    else setSearchParams({});
  };

  return (
    <div className="container section">
      <h1 className="page-title">Shop</h1>
      <p className="page-subtitle">Fresh groceries, sorted the way you shop.</p>

      <div className="shop-toolbar">
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="shop-search"
          aria-label="Search products"
        />

        <div className="shop-categories">
          <button
            className={`category-pill ${!categoryId ? 'category-pill-active' : ''}`}
            onClick={() => selectCategory('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-pill ${String(cat.id) === categoryId ? 'category-pill-active' : ''}`}
              onClick={() => selectCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="page-subtitle">Loading products…</p>
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : visibleProducts.length === 0 ? (
        <div className="empty-state">No products match your search yet.</div>
      ) : (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
