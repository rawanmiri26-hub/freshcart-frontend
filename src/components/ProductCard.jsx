import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const image = product.media?.[0]?.url;
  const outOfStock = !product.in_stock;

  return (
    <div className="product-card card">
      <Link to={`/shop?product=${product.id}`} className="product-card-media">
        {image ? (
          <img src={image} alt={product.name} />
        ) : (
          <div className="product-card-placeholder">🥬</div>
        )}
        {outOfStock && <span className="tag tag-alert product-card-badge">Out of stock</span>}
      </Link>
      <div className="product-card-body">
        {product.category_name && (
          <span className="tag tag-fresh product-card-category">{product.category_name}</span>
        )}
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-footer">
          <span className="product-card-price">${Number(product.price).toFixed(2)}</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => addItem(product)}
            disabled={outOfStock}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
