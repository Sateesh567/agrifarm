// pages/ProductCatalog.jsx
import React, { useState, useMemo } from 'react'
import { api, exportCSV } from '../api/client.js'

const CATEGORIES = ['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Weed Killers', 'Tools', 'Other']
const PAGE_SIZE  = 15

function ProductModal({ product, shops, onClose, onRefresh, showToast }) {
  const isEdit = !!product?.id
  const [form, setForm] = useState({
    shopId: product?.shopId || (shops[0]?.id || ''),
    name:   product?.name || '',
    category: product?.category || 'Seeds',
    price:  product?.price || '',
    stock:  product?.stock || '',
    description: product?.description || '',
    usageInstructions: product?.usageInstructions || '',
  })
  const [imagesBase64, setImagesBase64] = useState([])
  const [previews, setPreviews] = useState(product?.imageUrls || (product?.imageUrl ? [product.imageUrl] : []))
  const [saving, setSaving] = useState(false)

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const validFiles = files.filter(f => ALLOWED_TYPES.includes(f.type));
    if (validFiles.length !== files.length) {
      alert('Only JPG, JPEG, PNG, and WebP images are allowed.');
    }
    if (!validFiles.length) return;

    const bases = [];
    const prevs = [];
    for (const file of validFiles) {
      try {
        const compressedBase64 = await compressImage(file);
        bases.push(compressedBase64);
        prevs.push(compressedBase64);
      } catch (err) {
        console.error('Compression failed', err);
      }
    }
    setImagesBase64(prev => [...prev, ...bases]);
    setPreviews(prev => [...prev, ...prevs]);
  };

  const removePreview = (index) => {
    const item = previews[index];
    if (item.startsWith('data:')) {
      const base64Index = imagesBase64.indexOf(item);
      if (base64Index > -1) {
        const newBases = [...imagesBase64];
        newBases.splice(base64Index, 1);
        setImagesBase64(newBases);
      }
    }
    const newPrevs = [...previews];
    newPrevs.splice(index, 1);
    setPreviews(newPrevs);
  };

  const handle = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      imageUrl: JSON.stringify(previews.filter(p => !p.startsWith('data:'))),
      imagesBase64: imagesBase64
    }
    try {
      if (isEdit) await api.updateProduct(product.id, payload)
      else await api.addProduct(payload)
      showToast(isEdit ? 'Product updated!' : 'Product added!', 'success')
      onRefresh(); onClose()
    } catch(e) { showToast(e.message, 'error') }
    setSaving(false)
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? '✏️ Edit Product' : '➕ Add Product'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handle}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group form-full">
                <label className="form-label">Shop *</label>
                <select className="form-select" value={form.shopId} onChange={e => setForm(p => ({ ...p, shopId: e.target.value }))} required>
                  {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {['Seeds','Fertilizers','Pesticides','Weed Killers','Tools','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Stock *</label>
                <input className="form-input" type="number" min="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} required />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Product Photos (Upload multiple)</label>
                <input
                  className="form-input"
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                />
                {previews.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {previews.map((src, index) => (
                      <div key={index} style={{ position: 'relative', width: '60px', height: '60px', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={src.startsWith('data:') ? src : `http://localhost:3000/${src}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                        <button type="button" onClick={() => removePreview(index)} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group form-full">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Usage Instructions</label>
                <textarea className="form-textarea" value={form.usageInstructions} onChange={e => setForm(p => ({ ...p, usageInstructions: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving…' : '💾 Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProductCatalog({ products: allProducts, shops, onRefresh, showToast, loading }) {
  const [search, setSearch]     = useState('')
  const [cat, setCat]           = useState('All')
  const [sortBy, setSortBy]     = useState('created_at')
  const [sortDir, setSortDir]   = useState('desc')
  const [page, setPage]         = useState(1)
  const [modal, setModal]       = useState(null)
  const [stockEdit, setStockEdit] = useState({})

  const filtered = useMemo(() => {
    let r = [...allProducts]
    if (search) { const q = search.toLowerCase(); r = r.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) }
    if (cat !== 'All') r = r.filter(p => p.category === cat)
    r.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy]
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      return (va < vb ? -1 : va > vb ? 1 : 0) * (sortDir === 'asc' ? 1 : -1)
    })
    return r
  }, [allProducts, search, cat, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)
  const toggleSort = col => { if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(col); setSortDir('asc') } }
  const sortArrow  = col => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try { await api.deleteProduct(id); showToast('Product deleted', 'success'); onRefresh() }
    catch(e) { showToast(e.message, 'error') }
  }

  const handleStockSave = async (id) => {
    const val = parseInt(stockEdit[id])
    if (isNaN(val) || val < 0) { showToast('Invalid stock value', 'error'); return }
    try { await api.updateProduct(id, { stock: val }); showToast('Stock updated!', 'success'); onRefresh(); setStockEdit(p => ({ ...p, [id]: undefined })) }
    catch(e) { showToast(e.message, 'error') }
  }

  const handleExport = () => {
    exportCSV(filtered, 'agrifarm_products.csv', [
      { label: 'Name',     key: r => r.name },
      { label: 'Category', key: r => r.category },
      { label: 'Price',    key: r => r.price },
      { label: 'Stock',    key: r => r.stock },
      { label: 'Rating',   key: r => r.rating },
      { label: 'Active',   key: r => r.is_active ? 'Yes' : 'No' },
    ])
    showToast('CSV exported', 'success')
  }

  const stockClass = (stock) =>
    stock === 0 ? 'text-danger' : stock <= 10 ? '' : ''

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Product Catalog</h1>
          <p>{allProducts.length} products · {allProducts.filter(p => p.stock === 0).length} out of stock</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>⬇ Export CSV</button>
          {shops.length > 0
            ? <button className="btn btn-primary btn-sm" onClick={() => setModal({ product: null })}>➕ Add Product</button>
            : <span className="text-sm text-muted">No approved shops to add products to</span>}
        </div>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <h3>Products ({filtered.length})</h3>
          <div className="data-card-filters">
            <div className="search-input">
              <span className="search-input-icon">🔍</span>
              <input placeholder="Search products…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
            <select className="filter-select" value={cat} onChange={e => { setCat(e.target.value); setPage(1) }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading
          ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" /></div>
          : paginated.length === 0
          ? <div className="table-empty"><div className="table-empty-icon">📦</div><h3>No products found</h3></div>
          : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('name')}>Product{sortArrow('name')}</th>
                  <th onClick={() => toggleSort('category')}>Category{sortArrow('category')}</th>
                  <th onClick={() => toggleSort('price')}>Price{sortArrow('price')}</th>
                  <th onClick={() => toggleSort('stock')}>Stock{sortArrow('stock')}</th>
                  <th onClick={() => toggleSort('rating')}>Rating{sortArrow('rating')}</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="td-name">{p.name}</div>
                      <div className="text-sm text-muted">{p.description?.slice(0, 50) || '—'}</div>
                    </td>
                    <td><span className="badge badge-blue">{p.category}</span></td>
                    <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                    <td>
                      {stockEdit[p.id] !== undefined
                        ? <div className="flex gap-2 items-center">
                            <input type="number" className="form-input" style={{ width: 70, padding: '4px 8px' }}
                              value={stockEdit[p.id]} onChange={e => setStockEdit(s => ({ ...s, [p.id]: e.target.value }))} />
                            <button className="btn btn-primary btn-xs" onClick={() => handleStockSave(p.id)}>✓</button>
                            <button className="btn btn-ghost btn-xs" onClick={() => setStockEdit(s => ({ ...s, [p.id]: undefined }))}>✕</button>
                          </div>
                        : <div className="flex items-center gap-2">
                            <span className={stockClass(p.stock)} style={{ fontWeight: 600 }}>{p.stock}</span>
                            {p.stock === 0 && <span className="badge badge-red">Out</span>}
                            {p.stock > 0 && p.stock <= 10 && <span className="badge badge-yellow">Low</span>}
                            <button className="btn btn-ghost btn-xs" onClick={() => setStockEdit(s => ({ ...s, [p.id]: p.stock }))}>✏</button>
                          </div>}
                    </td>
                    <td>⭐ {p.rating || '5.0'}</td>
                    <td>{p.is_active ? <span className="badge badge-green">Active</span> : <span className="badge badge-gray">Inactive</span>}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-info btn-xs" onClick={() => setModal({ product: p })}>✏️ Edit</button>
                        <button className="btn btn-danger btn-xs" onClick={() => handleDelete(p.id, p.name)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <span className="pagination-info">Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="pagination-controls">
            <button className="page-btn" onClick={() => setPage(1)} disabled={page===1}>«</button>
            <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page===1}>‹</button>
            {Array.from({ length: Math.min(totalPages,5) }, (_, i) => {
              const n = Math.max(1, Math.min(page-2, totalPages-4)) + i
              return n <= totalPages && <button key={n} className={`page-btn${page===n?' active':''}`} onClick={() => setPage(n)}>{n}</button>
            })}
            <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page===totalPages}>›</button>
            <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page===totalPages}>»</button>
          </div>
        </div>
      </div>

      {modal && (
        <ProductModal
          product={modal.product}
          shops={shops.filter(s => s.status === 'APPROVED')}
          onClose={() => setModal(null)}
          onRefresh={onRefresh}
          showToast={showToast}
        />
      )}
    </div>
  )
}
