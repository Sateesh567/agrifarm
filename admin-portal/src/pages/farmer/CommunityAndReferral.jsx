import React, { useState } from 'react'

export default function CommunityAndReferral({ user, setView }) {
  const [activeTab, setActiveTab] = useState('community') // community | referral
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Rajesh Kumar',
      role: 'FARMER',
      date: '2026-07-06T10:00:00Z',
      question: 'Tomato leaf borders are turning yellow and curling up. Is this a blight disease or standard water stress?',
      replies: [
        {
          author: 'Bhoomi Organics (Merchant)',
          role: 'SHOP_OWNER',
          text: 'This looks like Early Blight. Check it on the Crop Scanner! Spray Neem Oil pesticide in the evening and keep the foliage dry.',
          date: '2026-07-06T14:30:00Z'
        },
        {
          author: 'Deva Swamy',
          role: 'FARMER',
          text: 'I had the same issue last month. Applying Organic NPK fertilizer base and weeding resolved it. Water directly at the root zone.',
          date: '2026-07-07T09:15:00Z'
        }
      ]
    },
    {
      id: 2,
      author: 'Subramanian Murugan',
      role: 'FARMER',
      date: '2026-07-05T08:20:00Z',
      question: 'What is the recommended seed depth for Premium Tomato Seeds during monsoon season?',
      replies: [
        {
          author: 'Salem Agro Field (Merchant)',
          role: 'SHOP_OWNER',
          text: 'Sow roughly 0.5cm to 1cm deep in porous, raised nursery beds. Avoid water logging as it rots seed coats.',
          date: '2026-07-05T11:00:00Z'
        }
      ]
    }
  ])

  // New post fields
  const [newQuestion, setNewQuestion] = useState('')
  // Reply fields
  const [replyTexts, setReplyTexts] = useState({})

  const handlePostSubmit = (e) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    const newPost = {
      id: Date.now(),
      author: user.name,
      role: user.role,
      date: new Date().toISOString(),
      question: newQuestion,
      replies: []
    }
    setPosts([newPost, ...posts])
    setNewQuestion('')
  }

  const handleReplySubmit = (postId) => {
    const text = replyTexts[postId]
    if (!text || !text.trim()) return

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [
            ...post.replies,
            {
              author: user.name,
              role: user.role,
              text: text,
              date: new Date().toISOString()
            }
          ]
        }
      }
      return post
    }))

    setReplyTexts({
      ...replyTexts,
      [postId]: ''
    })
  }

  const handleCopyCode = () => {
    const referralCode = `AGRI-${user.name.split(' ')[0].toUpperCase()}-${user.phone.substring(user.phone.length - 4) || '9999'}`
    navigator.clipboard.writeText(referralCode)
    alert(`Referral code copied to clipboard: ${referralCode}`)
  }

  return (
    <div className="community-referral-container">
      <style>{`
        .community-referral-container {
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
          color: var(--text);
        }
        .tab-bar {
          display: flex;
          border-bottom: 1px solid var(--border);
          margin-bottom: 24px;
          gap: 24px;
        }
        .tab-item {
          background: none;
          border: none;
          color: var(--text3);
          font-weight: 600;
          padding: 10px 0;
          font-size: 1rem;
          cursor: pointer;
          position: relative;
        }
        .tab-item.active {
          color: var(--primary);
        }
        .tab-item.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--primary);
        }
        .post-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          margin-bottom: 20px;
        }
        .post-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text3);
          margin-bottom: 10px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 8px;
        }
        .post-author {
          font-weight: 700;
          color: var(--primary);
        }
        .post-question {
          font-size: 0.95rem;
          font-weight: 500;
          line-height: 1.5;
          margin-bottom: 16px;
          color: var(--text);
        }
        .replies-section {
          background: var(--bg3);
          border-radius: var(--radius-sm);
          padding: 14px;
          margin-top: 10px;
        }
        .reply-item {
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.85rem;
        }
        .reply-item:last-child {
          border-bottom: none;
        }
        .reply-author {
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .reply-badge {
          background: var(--accent-a);
          color: var(--accent);
          font-size: 0.65rem;
          padding: 1px 4px;
          border-radius: 3px;
        }
        .reply-meta {
          font-size: 0.7rem;
          color: var(--text3);
          margin-top: 4px;
        }
        .reply-input-box {
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }
        .referral-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 32px;
        }
        @media (max-width: 768px) {
          .referral-grid {
            grid-template-columns: 1fr;
          }
        }
        .referral-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          text-align: center;
        }
        .code-box {
          border: 2px dashed var(--primary);
          background: var(--primary-a);
          color: var(--primary);
          font-family: monospace;
          font-size: 1.4rem;
          font-weight: 700;
          padding: 16px;
          border-radius: var(--radius-sm);
          margin: 20px 0;
          letter-spacing: 2px;
          cursor: pointer;
        }
        .voucher-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 16px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .voucher-unlocked {
          border-color: var(--primary);
          background: var(--primary-a);
        }
        .voucher-code {
          background: white;
          color: black;
          font-family: monospace;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem' }}>💬 Social Forums & Rewards</h2>
        <button className="btn btn-secondary btn-sm" onClick={() => setView('home')}>⬅️ Back to Shop</button>
      </div>

      <div className="tab-bar">
        <button className={`tab-item ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}>
          🌾 Farmer Discussion Board
        </button>
        <button className={`tab-item ${activeTab === 'referral' ? 'active' : ''}`} onClick={() => setActiveTab('referral')}>
          🎁 Referral Rewards & Invites
        </button>
      </div>

      {activeTab === 'community' ? (
        <div>
          {/* Create post box */}
          <div className="post-card" style={{ borderStyle: 'dashed' }}>
            <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', marginBottom: '10px' }}>Ask the AgriFarm Experts</h3>
            <form onSubmit={handlePostSubmit}>
              <textarea
                className="login-input"
                style={{ height: '70px', resize: 'none', border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                placeholder="Post crop issues, seed questions, or tool queries here..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary mt-12" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                📢 Post Question
              </button>
            </form>
          </div>

          {/* Posts list */}
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <span className="post-author">{post.author} ({post.role})</span>
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
              <div className="post-question">{post.question}</div>

              {/* Replies list */}
              <div className="replies-section">
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text2)' }}>
                  Replies ({post.replies.length})
                </h4>

                {post.replies.length === 0 ? (
                  <div style={{ fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text3)' }}>No responses yet. Write a suggestion!</div>
                ) : (
                  post.replies.map((rep, idx) => (
                    <div key={idx} className="reply-item">
                      <div className="reply-author">
                        <span>{rep.author}</span>
                        {rep.role === 'SHOP_OWNER' && <span className="reply-badge">Merchant</span>}
                        {rep.role === 'ADMIN' && <span className="reply-badge" style={{ background: 'var(--danger-a)', color: 'var(--danger)' }}>Staff</span>}
                      </div>
                      <div style={{ color: 'var(--text2)' }}>{rep.text}</div>
                      <div className="reply-meta">{new Date(rep.date).toLocaleString()}</div>
                    </div>
                  ))
                )}

                {/* Reply write box */}
                <div className="reply-input-box">
                  <input
                    className="login-input"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg2)', borderRadius: 'var(--radius-xs)', fontSize: '0.8rem', padding: '6px 12px' }}
                    type="text"
                    placeholder="Suggest a remedy or answer..."
                    value={replyTexts[post.id] || ''}
                    onChange={(e) => setReplyTexts({ ...replyTexts, [post.id]: e.target.value })}
                  />
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleReplySubmit(post.id)}
                    style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    💬 Reply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="referral-grid">
          {/* Left Column: Invite Card */}
          <div className="referral-card">
            <span style={{ fontSize: '3rem' }}>🎁</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginTop: '10px' }}>Invite Fellow Farmers</h2>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem', margin: '10px 0 20px 0', lineHeight: 1.4 }}>
              Unlock vouchers when friends register on the AgriFarm mobile or web application.
            </p>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Your Personal Referral Code:</div>
            <div className="code-box" onClick={handleCopyCode}>
              {`AGRI-${user.name.split(' ')[0].toUpperCase()}-${user.phone.substring(user.phone.length - 4) || '9999'}`}
            </div>

            <button className="btn btn-primary" onClick={handleCopyCode}>
              📋 Copy & Share Link
            </button>
          </div>

          {/* Right Column: Vouchers list */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '16px' }}>Available Milestone Vouchers</h3>

            <div className="voucher-card voucher-unlocked">
              <div>
                <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.9rem' }}>Milestone 1 Friend Unlocked!</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: '2px' }}>₹50 Discount on any Seeds purchase.</div>
              </div>
              <span className="voucher-code">WELCOME50</span>
            </div>

            <div className="voucher-card">
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text2)', fontSize: '0.9rem' }}>Milestone 3 Friends Lock</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '2px' }}>₹200 Discount on Tools/Equipment.</div>
              </div>
              <span className="voucher-code" style={{ opacity: 0.5 }}>SUPERFARM200</span>
            </div>

            <div className="voucher-card">
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text2)', fontSize: '0.9rem' }}>Milestone 5 Friends Lock</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '2px' }}>Free BioNeem Pesticide bottle on any order.</div>
              </div>
              <span className="voucher-code" style={{ opacity: 0.5 }}>FREENEEM</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
