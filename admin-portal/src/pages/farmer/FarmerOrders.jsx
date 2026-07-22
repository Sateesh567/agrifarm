import React, { useState, useEffect } from 'react'
import { api } from '../../api/client.js'

export default function FarmerOrders({ user, setView, lastPlacedOrderId }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewProduct, setReviewProduct] = useState(null)

  // Review fields
  const [rating, setRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const list = await api.getOrders()
      setOrders(list || [])

      // Auto-select active tracking order if available
      if (lastPlacedOrderId && list.length > 0) {
        const matching = list.find(o => o.orderId === lastPlacedOrderId)
        if (matching) setSelectedOrder(matching)
      } else if (list.length > 0) {
        setSelectedOrder(list[0])
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenReview = (product, order) => {
    setReviewProduct({ ...product, orderId: order.orderId })
    setRating(5)
    setReviewTitle('')
    setReviewBody('')
    setReviewError('')
    setReviewSuccess('')
    setShowReviewModal(true)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewProduct) return
    setSubmittingReview(true)
    setReviewError('')
    setReviewSuccess('')
    try {
      const payload = {
        productId: reviewProduct.productId,
        orderId: reviewProduct.orderId,
        rating,
        title: reviewTitle,
        body: reviewBody
      }
      await api.submitReview(payload)
      setReviewSuccess('Thank you! Your product review has been submitted.')
      setTimeout(() => {
        setShowReviewModal(false)
        setReviewProduct(null)
      }, 1500)
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review. Have you already reviewed this item?')
    } finally {
      setSubmittingReview(false)
    }
  }

  const getStepClass = (currentStatus, targetStatus) => {
    const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
    const currentIndex = statuses.indexOf(currentStatus)
    const targetIndex = statuses.indexOf(targetStatus)
    
    if (currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED') {
      return 'cancelled'
    }

    if (currentIndex >= targetIndex) {
      return 'active'
    }
    return ''
  }

  if (loading) {
    return <div className="loading" style={{ padding: '80px', textDecoration: 'none' }}>⏳ Retrieving your orders and logistics details...</div>
  }

  return (
    <div className="farmer-orders-container">
      <style>{`
        .farmer-orders-container {
          padding: 24px;
          max-width: 1100px;
          margin: 0 auto;
          color: var(--text);
        }
        .orders-layout {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 24px;
        }
        @media (max-width: 800px) {
          .orders-layout {
            grid-template-columns: 1fr;
          }
        }
        .order-sidebar-list {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px;
          height: 70vh;
          overflow-y: auto;
        }
        .order-sidebar-item {
          padding: 14px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          margin-bottom: 12px;
          cursor: pointer;
          transition: var(--transition);
        }
        .order-sidebar-item:hover {
          border-color: var(--primary);
          background: var(--primary-a);
        }
        .order-sidebar-item.active {
          border-color: var(--primary);
          background: var(--primary-a);
        }
        .order-sidebar-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text);
          display: flex;
          justify-content: space-between;
        }
        .order-sidebar-meta {
          font-size: 0.75rem;
          color: var(--text3);
          margin-top: 6px;
        }
        .status-badge-mini {
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-PENDING { background: rgba(245, 158, 11, 0.2); color: var(--accent); }
        .status-CONFIRMED { background: rgba(59, 130, 246, 0.2); color: var(--info); }
        .status-PROCESSING { background: rgba(59, 130, 246, 0.2); color: var(--info); }
        .status-SHIPPED { background: rgba(16, 185, 129, 0.2); color: var(--primary); }
        .status-DELIVERED { background: rgba(16, 185, 129, 0.2); color: var(--primary); }
        .status-CANCELLED { background: rgba(239, 68, 68, 0.2); color: var(--danger); }

        .order-details-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          height: fit-content;
        }
        .tracking-timeline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 32px 0;
          position: relative;
        }
        .tracking-timeline::before {
          content: '';
          position: absolute;
          left: 5%;
          right: 5%;
          height: 3px;
          background: var(--border);
          z-index: 1;
        }
        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
          font-size: 0.8rem;
          width: 20%;
          text-align: center;
        }
        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: var(--bg3);
          border: 3px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          margin-bottom: 8px;
          font-weight: 700;
          color: var(--text3);
          transition: var(--transition);
        }
        .timeline-step.active .step-circle {
          background: var(--primary);
          border-color: var(--primary-h);
          color: white;
          box-shadow: var(--shadow-glow);
        }
        .timeline-step.active {
          color: var(--primary);
          font-weight: 600;
        }
        .timeline-step.cancelled .step-circle {
          background: var(--danger);
          border-color: var(--danger);
          color: white;
        }
        .timeline-step.cancelled {
          color: var(--danger);
        }
        .invoice-box {
          border: 1px dashed var(--border);
          border-radius: var(--radius-sm);
          padding: 16px;
          margin-top: 24px;
          font-family: monospace;
          background: var(--bg3);
          font-size: 0.85rem;
        }
        .invoice-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .invoice-divider {
          border-top: 1px dashed var(--border);
          margin: 10px 0;
        }
        .review-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
        }
        .review-modal {
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: var(--radius-md);
          width: 450px;
          max-width: 90%;
          padding: 24px;
        }
        .star-rating {
          font-size: 2rem;
          color: var(--text3);
          display: flex;
          gap: 6px;
          margin: 16px 0;
          cursor: pointer;
        }
        .star-rating span.filled {
          color: var(--accent);
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem' }}>📋 Farming Orders Log</h2>
        <button className="btn btn-secondary btn-sm" onClick={() => setView('home')}>⬅️ Back to Shop</button>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', background: 'var(--bg2)', padding: '60px 0', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '4rem' }}>📦</span>
          <h3 style={{ marginTop: '20px' }}>No Orders Found</h3>
          <p style={{ color: 'var(--text2)', margin: '10px 0 20px 0' }}>You haven't placed any resource orders yet.</p>
          <button className="btn btn-primary" onClick={() => setView('home')}>Go to Catalog</button>
        </div>
      ) : (
        <div className="orders-layout">
          {/* Left Column: Side Bar List */}
          <div className="order-sidebar-list">
            {orders.map((o) => (
              <div
                key={o.orderId}
                className={`order-sidebar-item ${selectedOrder?.orderId === o.orderId ? 'active' : ''}`}
                onClick={() => setSelectedOrder(o)}
              >
                <div className="order-sidebar-title">
                  <span>{o.orderId}</span>
                  <span className={`status-badge-mini status-${o.status}`}>{o.status}</span>
                </div>
                <div style={{ fontWeight: '600', fontSize: '0.85rem', marginTop: '6px' }}>
                  Total: ₹{parseFloat(o.totalAmount).toFixed(2)}
                </div>
                <div className="order-sidebar-meta">
                  Date: {new Date(o.created_at).toLocaleDateString()} | {o.items?.length || 0} items
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Tracking Details */}
          {selectedOrder && (
            <div className="order-details-card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                Order Details: {selectedOrder.orderId}
              </h3>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '16px', fontSize: '0.9rem' }}>
                <div><strong>Placement Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                <div><strong>Current Logistics:</strong> <span className={`status-badge-mini status-${selectedOrder.status}`}>{selectedOrder.status}</span></div>
              </div>

              {/* Order State machine timeline */}
              <div className="tracking-timeline">
                {[
                  { label: 'Placed', code: 'PENDING' },
                  { label: 'Confirmed', code: 'CONFIRMED' },
                  { label: 'Processing', code: 'PROCESSING' },
                  { label: 'Shipped', code: 'SHIPPED' },
                  { label: 'Delivered', code: 'DELIVERED' }
                ].map((s, idx) => (
                  <div key={idx} className={`timeline-step ${getStepClass(selectedOrder.status, s.code)}`}>
                    <div className="step-circle">{idx + 1}</div>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Items List */}
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', margin: '24px 0 12px 0' }}>Ordered Items</h4>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Resource Item</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                      <th style={{ textAlign: 'right' }}>Line Total</th>
                      {selectedOrder.status === 'DELIVERED' && <th style={{ textAlign: 'center' }}>Review</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600' }}>{item.productName || 'Farming Item'}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>₹{parseFloat(item.price).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: '600' }}>₹{item.lineTotal.toFixed(2)}</td>
                        {selectedOrder.status === 'DELIVERED' && (
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn btn-xs btn-primary"
                              onClick={() => handleOpenReview(item, selectedOrder)}
                            >
                              ⭐ Write Review
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Printable Invoice receipt box */}
              <div className="invoice-box">
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', marginBottom: '10px' }}>🌱 AGRIFARM RETAIL INVOICE 🌱</div>
                <div className="invoice-divider" />
                <div className="invoice-row">
                  <span>Invoice No:</span>
                  <span>INV-{selectedOrder.orderId}</span>
                </div>
                <div className="invoice-row">
                  <span>Customer:</span>
                  <span>{user.name}</span>
                </div>
                <div className="invoice-row">
                  <span>Field Address:</span>
                  <span style={{ maxWidth: '220px', textAlign: 'right' }}>{selectedOrder.deliveryAddress}</span>
                </div>
                <div className="invoice-divider" />
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="invoice-row">
                    <span>{item.productName || 'Item'} x {item.quantity}</span>
                    <span>₹{item.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
                <div className="invoice-divider" />
                <div className="invoice-row">
                  <span>Subtotal:</span>
                  <span>₹{parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="invoice-row">
                  <span>Delivery Charge:</span>
                  <span>₹{(parseFloat(selectedOrder.totalAmount) - parseFloat(selectedOrder.subtotal)).toFixed(2)}</span>
                </div>
                <div className="invoice-row" style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                  <span>NET TOTAL PAID:</span>
                  <span>₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                </div>
                <div className="invoice-divider" />
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text3)' }}>* Thank you for farming with AgriFarm! *</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Dialog modal */}
      {showReviewModal && reviewProduct && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '8px' }}>Write Product Review</h3>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Share your feedback for <strong>{reviewProduct.productName}</strong>.</p>
            
            {reviewError && <div className="auth-error" style={{ margin: '12px 0 0 0' }}>{reviewError}</div>}
            {reviewSuccess && <div className="auth-success" style={{ margin: '12px 0 0 0' }}>{reviewSuccess}</div>}

            <form onSubmit={handleReviewSubmit}>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={rating >= star ? 'filled' : ''}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="login-label">Review Title</label>
                <input
                  className="login-input"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                  type="text"
                  placeholder="e.g. Excellent crop yield! Sprouted fast"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="login-label">Review Details</label>
                <textarea
                  className="login-input"
                  style={{ height: '100px', resize: 'none', border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                  placeholder="Write details about the seed sprout rate, fertilizer output, or tools efficiency..."
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary flex-1" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                </button>
                <button type="button" className="btn btn-secondary flex-1" onClick={() => { setShowReviewModal(false); setReviewProduct(null); }}>
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
