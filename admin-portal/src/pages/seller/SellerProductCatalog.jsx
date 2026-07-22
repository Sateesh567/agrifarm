import React, { useState, useEffect } from 'react'
import { api } from '../../api/client.js'

export default function SellerProductCatalog({ user, setView }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [shop, setShop] = useState(null)
  
  // Modal Fields
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null) // null for Add, product object for Edit
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form Fields
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Seeds')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [description, setDescription] = useState('')
  const [usageInstructions, setUsageInstructions] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadCatalog()
  }, [])

  const loadCatalog = async () => {
    setLoading(true)
    try {
      const allShops = await api.getShops()
      const myShop = allShops.find(s => s.ownerId === user.uid)
      setShop(myShop)
      
      if (myShop) {
        const list = await api.getProducts({ shopId: myShop.id })
        setProducts(list || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setEditProduct(null)
    setName('')
    setCategory('Seeds')
    setPrice('')
    setStock('')
    setDescription('')
    setUsageInstructions('')
    setImageUrl('')
    setError('')
    setSuccess('')
    setShowModal(true)
  }

  const handleOpenEdit = (prod) => {
    setEditProduct(prod)
    setName(prod.name || '')
    setCategory(prod.category || 'Seeds')
    setPrice(prod.price || '')
    setStock(prod.stock || '')
    setDescription(prod.description || '')
    setUsageInstructions(prod.usageInstructions || '')
    setImageUrl(prod.imageUrl || '')
    setError('')
    setSuccess('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!shop) return
    
    setSubmitting(true)
    setError('')
    setSuccess('')

    const payload = {
      shopId: shop.id,
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock),
      description,
      usageInstructions,
      imageUrl
    }

    try {
      if (editProduct) {
        // Edit Product (In server.js PUT is app.post('/api/products/:id', ...))
        await api.updateProduct(editProduct.id, payload)
        setSuccess('Product listing updated successfully!')
      } else {
        // Add Product
        await api.addProduct(payload)
        setSuccess('Product listing added successfully!')
      }
      
      setTimeout(() => {
        setShowModal(false)
        loadCatalog()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Action failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product listing?')) return
    try {
      await api.deleteProduct(productId)
      setProducts(products.filter(p => p.id !== productId))
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  if (loading) {
    return <div className="loading" style={{ padding: '80px', textDecoration: 'none' }}>⏳ Retrieving your shop catalog listings...</div>
  }

  return (
    <div className="seller-catalog-container">
      <style>{`
        .seller-catalog-container {
          padding: 24px;
          max-width: 1100px;
          margin: 0 auto;
          color: var(--text);
        }
        .catalog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .catalog-table-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .product-thumb-mini {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-xs);
          background: var(--bg3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          border: 1px solid var(--border);
        }
        .product-thumb-mini img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: var(--radius-xs);
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
        }
        .modal-card {
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: var(--radius-md);
          width: 500px;
          max-width: 90%;
          padding: 24px;
          max-height: 85vh;
          overflow-y: auto;
        }
      `}</style>

      <div className="catalog-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem' }}>📦 Crop Resource Listings</h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginTop: '4px' }}>Add seeds, fertilizers, or tools to be purchased by farmers.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            ➕ Add Product listing
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setView('dashboard')}>
            ⬅️ Back to Dashboard
          </button>
        </div>
      </div>

      {!shop ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '3rem' }}>🏪</span>
          <h3 style={{ marginTop: '20px' }}>Register Shop First</h3>
          <p style={{ color: 'var(--text2)', marginTop: '8px' }}>You must have a registered shop profile before adding products.</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '3rem' }}>🌱</span>
          <h3 style={{ marginTop: '20px' }}>No Listings Yet</h3>
          <p style={{ color: 'var(--text2)', margin: '10px 0 20px 0' }}>Your shop has no items listed. Add your first resource bag.</p>
          <button className="btn btn-primary" onClick={handleOpenAdd}>Add Product</button>
        </div>
      ) : (
        <div className="catalog-table-card">
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'center' }}>Stock</th>
                <th style={{ textAlign: 'center' }}>Rating</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="product-thumb-mini">
                      {p.imageUrl ? (
                        <img src={`http://localhost:3000/${p.imageUrl}`} alt={p.name} onError={(e)=>{e.target.style.display='none'; e.target.parentNode.textContent='📦'}} />
                      ) : (
                        '📦'
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: '600' }}>{p.name}</td>
                  <td><span className="category-pill">{p.category}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>₹{parseFloat(p.price).toFixed(2)}</td>
                  <td style={{ textAlign: 'center', fontWeight: '600' }} className={p.stock === 0 ? 'color-danger' : p.stock <= 5 ? 'color-warning' : ''}>
                    {p.stock === 0 ? '❌ Sold Out' : `${p.stock} bags`}
                  </td>
                  <td style={{ textAlign: 'center' }}>⭐ {p.rating || '5.0'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary btn-xs" onClick={() => handleOpenEdit(p)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-danger btn-xs" onClick={() => handleDelete(p.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal popup */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              {editProduct ? 'Edit Product Listing' : 'Add New Product Listing'}
            </h3>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label className="login-label">Product / Crop Name</label>
                <input
                  className="login-input"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                  type="text"
                  placeholder="e.g. Hybrid Pearl Millet Seeds"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="login-label">Category</label>
                  <select
                    className="login-input"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Pesticides">Pesticides</option>
                    <option value="Weed Killers">Weed Killers</option>
                    <option value="Tools">Tools</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="login-label">Price (INR)</label>
                  <input
                    className="login-input"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                    type="number"
                    step="0.01"
                    placeholder="₹ 450.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min={0}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="login-label">Initial Stock (Bags)</label>
                  <input
                    className="login-input"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                    type="number"
                    placeholder="100"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    min={0}
                  />
                </div>
                <div>
                  <label className="login-label">Cover Image URL (Optional)</label>
                  <input
                    className="login-input"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                    type="text"
                    placeholder="images/tomato_seeds.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="login-label">Specifications / Description</label>
                <textarea
                  className="login-input"
                  style={{ height: '70px', resize: 'none', border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                  placeholder="NPK 19:19:19 compound or highly resilient hybrid wheat seeds..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="login-label">Usage / Spreading Directives</label>
                <textarea
                  className="login-input"
                  style={{ height: '70px', resize: 'none', border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                  placeholder="Mix 20g per square meter base, spray every 10 days..."
                  value={usageInstructions}
                  onChange={(e) => setUsageInstructions(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                  {submitting ? '⏳ Saving Listing...' : '💾 Save Listing'}
                </button>
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
