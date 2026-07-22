import React, { useState } from 'react'
import { api } from '../../api/client.js'

export default function CartAndCheckout({
  cart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setView,
  user,
  setLastPlacedOrderId
}) {
  const [step, setStep] = useState('cart') // cart | checkout | success
  const [address, setAddress] = useState(user.address || '')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)

  const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0)
  const deliveryFee = subtotal > 1000 ? 0 : 50
  const total = subtotal + deliveryFee

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault()
    if (!cart || cart.length === 0) {
      setError('Your cart is empty.')
      return
    }
    if (!address.trim()) {
      setError('Delivery address is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      // Group items by shopId
      // In a real application, if there are items from different shops, we might split the order.
      // For simplicity, we will use the shopId of the first item, as matching the Android app behavior.
      const shopId = cart[0]?.shopId || 'S1'
      
      const payload = {
        shopId,
        deliveryAddress: address,
        notes: notes || `Paid via ${paymentMethod}`,
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity
        }))
      }

      const res = await api.placeOrder(payload)
      setPlacedOrder(res)
      setLastPlacedOrderId(res.orderId)
      clearCart()
      setStep('success')
    } catch (err) {
      setError(err.message || 'Order submission failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cart-checkout-container">
      <style>{`
        .cart-checkout-container {
          padding: 24px;
          max-width: 900px;
          margin: 0 auto;
          color: var(--text);
        }
        .stepper-header {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 32px;
          gap: 16px;
        }
        .step-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text3);
        }
        .step-indicator.active {
          color: var(--primary);
        }
        .step-num {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .step-indicator.active .step-num {
          border-color: var(--primary);
          background: var(--primary);
          color: white;
        }
        .checkout-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
        }
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }
        }
        .summary-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          height: fit-content;
        }
        .cart-table-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .cart-table-row:last-child {
          border-bottom: none;
        }
        .cart-item-title {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .cart-item-price {
          color: var(--text2);
          font-size: 0.85rem;
          margin-top: 4px;
        }
        .cart-quantity-controls {
          display: flex;
          align-items: center;
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: var(--radius-xs);
        }
        .cart-quantity-controls button {
          background: none;
          border: none;
          color: var(--text);
          width: 28px;
          height: 28px;
          cursor: pointer;
          font-weight: bold;
        }
        .cart-quantity-controls span {
          width: 30px;
          text-align: center;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .payment-option {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 14px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .payment-option:hover {
          border-color: var(--primary);
        }
        .payment-option.active {
          border-color: var(--primary);
          background: var(--primary-a);
        }
        .payment-option input {
          pointer-events: none;
        }
        .success-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 40px;
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
        }
        .success-checkmark {
          font-size: 4rem;
          margin-bottom: 20px;
          animation: scaleIn 0.5s ease-out;
        }
        @keyframes scaleIn {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Stepper indicators */}
      {step !== 'success' && (
        <div className="stepper-header">
          <div className={`step-indicator ${step === 'cart' ? 'active' : ''}`} onClick={() => cart.length > 0 && setStep('cart')}>
            <span className="step-num">1</span>
            <span>Shopping Cart</span>
          </div>
          <span style={{ color: 'var(--border)' }}>➔</span>
          <div className={`step-indicator ${step === 'checkout' ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span>Checkout details</span>
          </div>
        </div>
      )}

      {step === 'cart' && (
        <div>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <span style={{ fontSize: '4rem' }}>🛒</span>
              <h3 style={{ marginTop: '20px' }}>Your Cart is Empty</h3>
              <p style={{ color: 'var(--text2)', margin: '10px 0 20px 0' }}>Explore seeds, fertilizers, and tools in our catalog.</p>
              <button className="btn btn-primary" onClick={() => setView('home')}>Start Shopping</button>
            </div>
          ) : (
            <div className="checkout-grid">
              {/* Left Column: Cart Items List */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '16px' }}>Selected Resources</h3>
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 20px' }}>
                  {cart.map((item) => (
                    <div key={item.id} className="cart-table-row">
                      <div>
                        <div className="cart-item-title">{item.name}</div>
                        <div className="cart-item-price">₹{parseFloat(item.price).toFixed(2)} / bag</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="cart-quantity-controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</button>
                        </div>
                        
                        <div style={{ width: '80px', textAlign: 'right', fontWeight: '700', fontSize: '0.95rem' }}>
                          ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>

                        <button
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }}
                          onClick={() => removeFromCart(item.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Cost Summary */}
              <div className="summary-card">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>Cost Summary</h3>
                <table className="table" style={{ fontSize: '0.9rem' }}>
                  <tbody>
                    <tr>
                      <td style={{ color: 'var(--text2)' }}>Subtotal</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>₹{subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--text2)' }}>Delivery Fee</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>
                        {deliveryFee === 0 ? <span style={{ color: 'var(--primary)' }}>FREE</span> : `₹${deliveryFee.toFixed(2)}`}
                      </td>
                    </tr>
                    {deliveryFee > 0 && (
                      <tr>
                        <td colSpan="2" style={{ fontSize: '0.75rem', color: 'var(--text3)', fontStyle: 'italic' }}>
                          💡 Spend ₹1,000+ to unlock FREE delivery!
                        </td>
                      </tr>
                    )}
                    <tr style={{ borderTop: '2px solid var(--border)' }}>
                      <td style={{ fontWeight: '700', fontSize: '1rem', paddingTop: '12px' }}>Total Amount</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '1.1rem', paddingTop: '12px', color: 'var(--primary)' }}>
                        ₹{total.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <button
                  className="btn btn-primary w-full mt-20"
                  onClick={() => setStep('checkout')}
                >
                  Proceed to Checkout ➔
                </button>
                <button
                  className="btn btn-secondary w-full mt-10"
                  onClick={() => setView('home')}
                >
                  Add More Items
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'checkout' && (
        <form onSubmit={handleCheckoutSubmit}>
          <div className="checkout-grid">
            {/* Left Column: Form Details */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '16px' }}>Shipping & Address</h3>
              
              {error && <div className="auth-error">{error}</div>}

              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="login-label" style={{ display: 'block', marginBottom: '8px' }}>Delivery Address</label>
                  <textarea
                    className="login-input"
                    style={{ height: '80px', resize: 'none', border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                    placeholder="Enter full home/field delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="login-label" style={{ display: 'block', marginBottom: '8px' }}>Delivery Instructions (Optional)</label>
                  <input
                    className="login-input"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                    type="text"
                    placeholder="e.g. Leave near the main borewell gate"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '16px' }}>Select Payment Method</h3>
              <div>
                {[
                  { id: 'COD', name: 'Cash on Delivery (COD)', desc: 'Pay with physical cash upon receiving bags' },
                  { id: 'UPI', name: 'Unified Payments Interface (UPI)', desc: 'Instant transfer via GPay, PhonePe, or BHIM' },
                  { id: 'CARD', name: 'Debit / Credit Card', desc: 'Secure gateway checkouts' },
                  { id: 'NETBANKING', name: 'Internet Banking', desc: 'Secure log-in from commercial banks' },
                  { id: 'WALLET', name: 'Digital Wallets', desc: 'Pay via Paytm or Amazon Pay' }
                ].map((pay) => (
                  <div
                    key={pay.id}
                    className={`payment-option ${paymentMethod === pay.id ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(pay.id)}
                  >
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={paymentMethod === pay.id}
                      onChange={() => {}}
                    />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{pay.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: '2px' }}>{pay.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Checkout Summary info */}
            <div className="summary-card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>Summary</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '8px' }}>
                <span>Items:</span>
                <span>{cart.reduce((a,c) => a + c.quantity, 0)} bags</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '16px' }}>
                <span>Deliver to:</span>
                <span style={{ maxWidth: '120px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{address || 'Not specified'}</span>
              </div>

              <table className="table" style={{ fontSize: '0.9rem', borderTop: '1px solid var(--border)' }}>
                <tbody>
                  <tr>
                    <td style={{ color: 'var(--text2)' }}>Total Order Cost</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '1.1rem', color: 'var(--primary)' }}>₹{total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <button
                type="submit"
                className="btn btn-primary w-full mt-20"
                disabled={loading}
              >
                {loading ? '⏳ Dispatching Order...' : '🚀 Place Order (Confirm)'}
              </button>
              <button
                type="button"
                className="btn btn-secondary w-full mt-10"
                onClick={() => setStep('cart')}
              >
                ⬅️ Back to Cart
              </button>
            </div>
          </div>
        </form>
      )}

      {step === 'success' && (
        <div className="success-card">
          <div className="success-checkmark">🎉</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--primary)' }}>Order Placed Successfully!</h2>
          <p style={{ color: 'var(--text2)', margin: '16px 0', fontSize: '0.95rem' }}>
            Thank you! Your order <strong>{placedOrder?.orderId}</strong> has been received and is being processed by the merchant.
          </p>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', padding: '16px', marginBottom: '24px', textAlign: 'left', fontSize: '0.85rem' }}>
            <div><strong>Payment Mode:</strong> {paymentMethod}</div>
            <div style={{ marginTop: '6px' }}><strong>Deliver to:</strong> {address}</div>
            <div style={{ marginTop: '6px' }}><strong>Order Value:</strong> ₹{total.toFixed(2)}</div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary flex-1" onClick={() => setView('orders')}>
              Track Live Order ➔
            </button>
            <button className="btn btn-secondary flex-1" onClick={() => setView('home')}>
              Shop More Items
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
