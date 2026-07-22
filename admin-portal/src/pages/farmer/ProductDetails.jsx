import React, { useState, useEffect } from 'react'
import { api } from '../../api/client.js'

export default function ProductDetails({
  productId,
  addToCart,
  setView,
  wishlist = [],
  toggleWishlist
}) {
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('specs') // specs | usage | reviews
  const [shop, setShop] = useState(null)

  useEffect(() => {
    loadDetails()
  }, [productId])

  const loadDetails = async () => {
    setLoading(true)
    try {
      // 1. Fetch Product
      const prod = await api.getProducts().then(list => list.find(p => p.id === productId))
      setProduct(prod)

      // 2. Fetch Reviews
      const revs = await api.getProductReviews(productId)
      setReviews(revs || [])

      // 3. Fetch Shop details if product exists
      if (prod && prod.shopId) {
        const shopDetails = await api.getShops().then(list => list.find(s => s.id === prod.shopId))
        setShop(shopDetails)
      }
    } catch (err) {
      console.error('Error fetching product details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    if (!product) return
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    setView('cart')
  }

  if (loading) {
    return <div className="loading" style={{ padding: '80px', textDecoration: 'none' }}>⏳ Fetching product details...</div>
  }

  if (!product) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <h3>Product not found</h3>
        <button className="btn btn-secondary mt-10" onClick={() => setView('home')}>Back to Home</button>
      </div>
    )
  }

  const isWishlisted = wishlist.includes(productId)

  return (
    <div className="product-details-container">
      <style>{`
        .product-details-container {
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
          color: var(--text);
        }
        .back-row {
          margin-bottom: 20px;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1.2fr 1.8fr;
          gap: 32px;
          margin-bottom: 40px;
        }
        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
        .image-gallery-panel {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          font-size: 6rem;
        }
        .image-gallery-panel img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: var(--radius-md);
        }
        .wishlist-details-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid var(--border);
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .wishlist-details-btn.active {
          background: var(--danger-a);
          border-color: var(--danger);
          color: var(--danger);
        }
        .product-meta h1 {
          font-family: var(--font-heading);
          font-size: 2rem;
          color: var(--text);
        }
        .category-pill {
          background: var(--primary-a);
          color: var(--primary);
          padding: 4px 10px;
          border-radius: var(--radius-xs);
          font-size: 0.8rem;
          font-weight: 600;
          display: inline-block;
          margin-top: 10px;
        }
        .shop-link-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text2);
          margin-top: 12px;
        }
        .price-section {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 20px;
          margin-top: 24px;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .price-val {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
          color: var(--text);
        }
        .stock-indicator {
          font-size: 0.85rem;
          font-weight: 600;
        }
        .stock-in { color: var(--primary); }
        .stock-out { color: var(--danger); }
        
        .quantity-stepper {
          display: flex;
          align-items: center;
          background: var(--bg3);
          border-radius: var(--radius-xs);
          border: 1px solid var(--border);
          width: fit-content;
          margin-top: 16px;
        }
        .quantity-stepper button {
          background: none;
          border: none;
          color: var(--text);
          width: 36px;
          height: 36px;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 600;
          transition: var(--transition);
        }
        .quantity-stepper button:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .quantity-stepper span {
          width: 40px;
          text-align: center;
          font-weight: 600;
        }
        .action-row {
          display: flex;
          gap: 16px;
          margin-top: 24px;
        }
        .tab-navigation {
          display: flex;
          border-bottom: 1px solid var(--border);
          margin-bottom: 24px;
          gap: 24px;
        }
        .tab-btn {
          background: none;
          border: none;
          color: var(--text3);
          padding: 10px 0;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          transition: var(--transition);
        }
        .tab-btn:hover {
          color: var(--text);
        }
        .tab-btn.active {
          color: var(--primary);
        }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--primary);
        }
        .tab-content {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          line-height: 1.6;
        }
        .sprout-info-panel {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
          border: 1px solid rgba(16, 185, 129, 0.15);
          border-radius: var(--radius-sm);
          padding: 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sprout-badge {
          background: var(--primary);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
        }
        .review-card {
          border-bottom: 1px solid var(--border);
          padding: 16px 0;
        }
        .review-card:last-child {
          border-bottom: none;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .review-author {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .review-rating {
          color: var(--accent);
        }
        .review-body {
          color: var(--text2);
          font-size: 0.9rem;
        }
        .review-date {
          font-size: 0.75rem;
          color: var(--text3);
          margin-top: 4px;
        }
      `}</style>

      {/* Back navigation */}
      <div className="back-row">
        <button className="btn btn-secondary btn-sm" onClick={() => setView('home')}>
          ⬅️ Back to Shop Home
        </button>
      </div>

      {/* Product Details Grid */}
      <div className="details-grid">
        {/* Left column: Image and Wishlist toggle */}
        <div>
          <div className="image-gallery-panel">
            <button
              className={`wishlist-details-btn ${isWishlisted ? 'active' : ''}`}
              onClick={() => toggleWishlist(productId)}
            >
              ❤️
            </button>
            {product.imageUrl ? (
              <img src={`http://localhost:3000/${product.imageUrl}`} alt={product.name} onError={(e)=>{e.target.style.display='none'; e.target.parentNode.textContent='📦'}} />
            ) : (
              '📦'
            )}
          </div>
        </div>

        {/* Right column: Info, Pricing, Stepper, Actions */}
        <div className="product-meta">
          <span className="category-pill">{product.category}</span>
          <h1 style={{ marginTop: '8px' }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <span style={{ color: 'var(--accent)', fontWeight: '600' }}>⭐ {product.rating || '5.0'}</span>
            <span style={{ color: 'var(--text3)' }}>|</span>
            <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{reviews.length} Customer Reviews</span>
          </div>

          {shop && (
            <div className="shop-link-row">
              <span>🏪 Sold by:</span>
              <strong style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => { setView(`shop-catalog-${shop.id}`) }}>
                {shop.name}
              </strong>
              <span>({shop.rating} ★ Rating)</span>
            </div>
          )}

          {/* Pricing Section */}
          <div className="price-section">
            <div className="price-row">
              <span className="price-val">₹{parseFloat(product.price).toFixed(2)}</span>
              <span className={`stock-indicator ${product.stock > 0 ? 'stock-in' : 'stock-out'}`}>
                {product.stock > 0 ? `🟢 In Stock (${product.stock} bags remaining)` : '🔴 Temporarily Out of Stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <>
                <div className="quantity-stepper">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
                </div>

                <div className="action-row">
                  <button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }} onClick={handleAddClick}>
                    🛒 Buy & Add to Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="tab-navigation">
        <button className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>
          Product Specifications
        </button>
        <button className={`tab-btn ${activeTab === 'usage' ? 'active' : ''}`} onClick={() => setActiveTab('usage')}>
          Usage Instructions
        </button>
        <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
          Customer Reviews ({reviews.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'specs' && (
          <div>
            {product.category === 'Seeds' && (
              <div className="sprout-info-panel">
                <div className="sprout-badge">92%</div>
                <div>
                  <h4 style={{ fontWeight: '700' }}>Lab Verified Sprouting Rate</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '2px' }}>This seed batch has been certified by TNAU. Highly immune to stem-blight.</p>
                </div>
              </div>
            )}
            <h4 style={{ marginBottom: '10px' }}>Description</h4>
            <p style={{ color: 'var(--text2)' }}>{product.description || 'No description available for this item.'}</p>
            
            <table className="table" style={{ marginTop: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '200px', fontWeight: '600' }}>Category</td>
                  <td>{product.category}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Quality Certification</td>
                  <td>AgriGrade A+ Standard</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Packaging Size</td>
                  <td>25 Kg / Bag</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Origin</td>
                  <td>Coimbatore, India</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'usage' && (
          <div>
            <h4 style={{ marginBottom: '12px' }}>Farming Directives & Safety Guidelines</h4>
            <p style={{ color: 'var(--text2)', whiteSpace: 'pre-line' }}>
              {product.usageInstructions || 'Apply base compound evenly. Water the field immediately within 24 hours after application.'}
            </p>
            
            <div style={{ marginTop: '20px', padding: '14px', background: 'var(--warning-a)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem', color: 'var(--text2)' }}>
              <strong>⚠️ Caution:</strong> Store in a cool dry place away from children. Always wear protective gloves and masks while spreading chemical compounds.
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h4 style={{ marginBottom: '16px' }}>What other farmers are saying</h4>
            {reviews.length === 0 ? (
              <div style={{ color: 'var(--text3)', padding: '20px 0' }}>No reviews have been written for this product yet. Be the first to write a review!</div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="review-card">
                  <div className="review-header">
                    <span className="review-author">{r.authorName || 'Verified Buyer'}</span>
                    <span className="review-rating">{'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.title && <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>{r.title}</div>}
                  <p className="review-body">{r.body}</p>
                  <div className="review-date">{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
