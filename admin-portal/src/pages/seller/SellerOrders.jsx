import React, { useState, useEffect } from 'react'
import { api } from '../../api/client.js'

export default function SellerOrders({ user, setView }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [shop, setShop] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const allShops = await api.getShops()
      const myShop = allShops.find(s => s.ownerId === user.uid)
      setShop(myShop)

      if (myShop) {
        const list = await api.getOrders({ shopId: myShop.id })
        setOrders(list || [])
        if (list.length > 0) setSelectedOrder(list[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(true)
    try {
      // In server.js status is app.post('/api/orders/:id/status', requireRole('SHOP_OWNER', 'ADMIN'), ...)
      const updated = await api.updateOrderStatus(orderId, newStatus)
      
      // Update local state lists
      setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: updated.status } : o))
      setSelectedOrder(prev => prev && prev.orderId === orderId ? { ...prev, status: updated.status } : prev)
      
      alert(`Order ${orderId} updated to ${newStatus} successfully!`)
    } catch (err) {
      alert('Status change failed: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  // State Machine logic to determine next step actions
  const getNextTransitions = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDING':
        return [
          { status: 'CONFIRMED', label: '✅ Confirm Order', class: 'btn-primary' },
          { status: 'CANCELLED', label: '❌ Cancel Order', class: 'btn-danger' }
        ]
      case 'CONFIRMED':
        return [
          { status: 'PROCESSING', label: '⚙️ Start Processing', class: 'btn-primary' },
          { status: 'CANCELLED', label: '❌ Cancel Order', class: 'btn-danger' }
        ]
      case 'PROCESSING':
        return [
          { status: 'SHIPPED', label: '🚚 Ship Order (Out for Delivery)', class: 'btn-primary' },
          { status: 'CANCELLED', label: '❌ Cancel Order', class: 'btn-danger' }
        ]
      case 'SHIPPED':
        return [
          { status: 'DELIVERED', label: '📦 Mark as Delivered', class: 'btn-primary' }
        ]
      case 'DELIVERED':
        return []
      case 'RETURN_REQUESTED':
        return [
          { status: 'REFUNDED', label: '💰 Approve Refund', class: 'btn-primary' }
        ]
      default:
        return []
    }
  }

  if (loading) {
    return <div className="loading" style={{ padding: '80px', textDecoration: 'none' }}>⏳ Fetching customer orders list...</div>
  }

  return (
    <div className="seller-orders-container">
      <style>{`
        .seller-orders-container {
          padding: 24px;
          max-width: 1100px;
          margin: 0 auto;
          color: var(--text);
        }
        .orders-layout {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
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
        .order-details-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          height: fit-content;
        }
        .action-panel-status {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 16px;
          margin-top: 20px;
        }
        .action-buttons-row {
          display: flex;
          gap: 12px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem' }}>📋 Customer Orders</h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginTop: '4px' }}>Fulfill and update logistics delivery progress for farmer orders.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setView('dashboard')}>⬅️ Back to Dashboard</button>
      </div>

      {!shop ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '3rem' }}>🏪</span>
          <h3 style={{ marginTop: '20px' }}>Register Shop First</h3>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '3rem' }}>📦</span>
          <h3 style={{ marginTop: '20px' }}>No Orders Received</h3>
          <p style={{ color: 'var(--text2)', marginTop: '8px' }}>Your shop has not received any customer orders yet.</p>
        </div>
      ) : (
        <div className="orders-layout">
          {/* Left Column Sidebar */}
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
                  Amount: ₹{parseFloat(o.totalAmount).toFixed(2)}
                </div>
                <div className="order-sidebar-meta">
                  Date: {new Date(o.created_at).toLocaleDateString()} | {o.items?.length || 0} items
                </div>
              </div>
            ))}
          </div>

          {/* Right Column Details */}
          {selectedOrder && (
            <div className="order-details-card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                Order Summary: {selectedOrder.orderId}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text2)' }}>
                <div><strong>Placement Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                <div><strong>Customer Uid:</strong> {selectedOrder.farmerUid}</div>
                <div><strong>Delivery Address:</strong> {selectedOrder.deliveryAddress}</div>
                {selectedOrder.notes && <div><strong>Delivery Notes:</strong> {selectedOrder.notes}</div>}
              </div>

              {/* Items List */}
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', margin: '20px 0 10px 0' }}>Ordered Resources</h4>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '20px' }}>
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th style={{ textAlign: 'center' }}>Quantity</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600' }}>{item.productName || 'Farming Item'}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>₹{parseFloat(item.price).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>₹{item.lineTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--bg3)' }}>
                      <td colSpan="3" style={{ fontWeight: '700' }}>Total Paid Amount</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Workflow Stepper Action Buttons */}
              <div className="action-panel-status">
                <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
                  Current Order Status: <span className={`status-badge-mini status-${selectedOrder.status}`}>{selectedOrder.status}</span>
                </div>
                
                {getNextTransitions(selectedOrder.status).length > 0 ? (
                  <>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '8px' }}>Move status to next logistics stage:</div>
                    <div className="action-buttons-row">
                      {getNextTransitions(selectedOrder.status).map((t, idx) => (
                        <button
                          key={idx}
                          className={`btn ${t.class} btn-sm`}
                          disabled={updating}
                          onClick={() => handleStatusUpdate(selectedOrder.orderId, t.status)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '10px', fontStyle: 'italic' }}>
                    ✔ Order has reached its final state. No further updates allowed.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
