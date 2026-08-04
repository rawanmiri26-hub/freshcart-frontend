import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/api/categories'), api.get('/api/products')])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data.slice(0, 6));
        setFeatured(prodRes.data.slice(0, 8));
      })
      .catch(() => {
        // Keep the page usable even if the API is briefly unreachable
        setCategories([]);
        setFeatured([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="tag tag-fresh">Delivered fresh, daily</span>
            <h1>Groceries that taste like they were picked this morning.</h1>
            <p>
              Real produce, real pantry staples, delivered to your door — no subscription,
              no markup games, just fresh food fast.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary">
                Start shopping
              </Link>
              <Link to="/ai-planner" className="btn btn-outline">
                Plan my week
              </Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            🥑🍅🥦
          </div>
        </div>
      </section>

      <section className="container section">
        <h2>Shop by category</h2>
        {loading ? (
          <p className="page-subtitle">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="page-subtitle">Categories will appear here once added.</p>
        ) : (
          <div className="category-row">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.id}`} className="category-pill">
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="container section">
        <div className="section-heading-row">
          <h2>Fresh picks this week</h2>
          <Link to="/shop" className="btn-link">
            View all →
          </Link>
        </div>
        {loading ? (
          <p className="page-subtitle">Loading products…</p>
        ) : featured.length === 0 ? (
          <div className="empty-state">No products yet — check back soon.</div>
        ) : (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
