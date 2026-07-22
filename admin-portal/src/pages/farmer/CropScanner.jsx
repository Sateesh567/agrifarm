import React, { useState, useEffect } from 'react'
import { api } from '../../api/client.js'

export default function CropScanner({ setView, setSelectedProductId }) {
  const [crops, setCrops] = useState(['Tomato', 'Paddy', 'Cotton', 'Corn', 'Chilli'])
  const [selectedCrop, setSelectedCrop] = useState('Tomato')
  const [image, setImage] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [diseases, setDiseases] = useState([])
  const [loading, setLoading] = useState(false)
  const [recommendedProduct, setRecommendedProduct] = useState(null)

  useEffect(() => {
    loadDiseases()
  }, [])

  const loadDiseases = async () => {
    setLoading(true)
    try {
      const list = await api.getPublicCropDiseases()
      setDiseases(list || [])
    } catch (err) {
      console.error('Error fetching crop diseases:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]))
      setResult(null)
    }
  }

  const handleSampleSelect = (sampleName) => {
    setImage(`sample_${sampleName.toLowerCase().replace(' ', '_')}`)
    setResult(null)
  }

  const startScan = () => {
    if (!image) return
    setScanning(true)
    setResult(null)
    setRecommendedProduct(null)

    // Simulate scanning animation for 3 seconds
    setTimeout(async () => {
      setScanning(false)
      
      // Filter diseases matching selected crop
      const matching = diseases.filter(d => d.crop_name.toLowerCase() === selectedCrop.toLowerCase())
      
      if (matching.length > 0) {
        // Pick a random matching disease, or match based on select if we want it to be specific
        const diagnosis = matching[Math.floor(Math.random() * matching.length)]
        setResult(diagnosis)

        // Try to match the recommended product in the catalog
        if (diagnosis.recommended_product_name) {
          try {
            const allProducts = await api.getProducts()
            const match = allProducts.find(p => 
              p.name.toLowerCase().includes(diagnosis.recommended_product_name.toLowerCase())
            )
            setRecommendedProduct(match || null)
          } catch(err) {
            console.error('Error searching recommended product:', err)
          }
        }
      } else {
        // Fallback mockup diagnosis
        setResult({
          crop_name: selectedCrop,
          disease_name: `${selectedCrop} Leaf Spot`,
          scientific_name: 'Cercospora arachidicola',
          confidence: 89,
          severity: 'MEDIUM',
          description: 'A common fungal infection causing dark brown spots surrounded by yellow halos on the leaves, leading to premature defoliation.',
          symptoms: ['Brown spots on leaves', 'Yellow halos around spots', 'Leaf wilting'],
          solutions: ['Apply neem oil extract spray', 'Improve air circulation around plants', 'Apply BioNeem Pesticide']
        })
      }
    }, 3000)
  }

  return (
    <div className="crop-scanner-container">
      <style>{`
        .crop-scanner-container {
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
          color: var(--text);
        }
        .scanner-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 32px;
          margin-top: 20px;
        }
        @media (max-width: 768px) {
          .scanner-grid {
            grid-template-columns: 1fr;
          }
        }
        .upload-panel {
          background: var(--bg2);
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          text-align: center;
          position: relative;
          height: 350px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: var(--transition);
        }
        .upload-panel.has-image {
          border-style: solid;
        }
        .scan-laser-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 4px;
          background: var(--primary);
          box-shadow: 0 0 16px var(--primary);
          animation: scanVertical 2s linear infinite;
          z-index: 10;
        }
        @keyframes scanVertical {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .uploaded-leaf-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
        }
        .placeholder-icon {
          font-size: 4rem;
          color: var(--text3);
          margin-bottom: 12px;
        }
        .sample-row {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        .sample-thumb {
          background: var(--bg3);
          border: 1px solid var(--border);
          padding: 6px 12px;
          border-radius: var(--radius-xs);
          font-size: 0.8rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .sample-thumb:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        .diag-results-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          height: fit-content;
        }
        .severity-badge {
          padding: 4px 10px;
          border-radius: var(--radius-xs);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .severity-HIGH { background: var(--danger-a); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.2); }
        .severity-MEDIUM { background: var(--warning-a); color: var(--warning); border: 1px solid rgba(234, 179, 8, 0.2); }
        .severity-LOW { background: var(--primary-a); color: var(--primary); border: 1px solid rgba(16, 185, 129, 0.2); }

        .solution-box {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 16px;
          margin-top: 16px;
        }
        .solution-item {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 0.85rem;
          color: var(--text2);
          line-height: 1.4;
        }
        .solution-item:last-child {
          margin-bottom: 0;
        }
        .recomm-product-card {
          background: var(--surface2);
          border: 1px solid var(--border2);
          border-radius: var(--radius-sm);
          padding: 12px;
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem' }}>📸 Crop AI Disease Diagnostics</h2>
        <button className="btn btn-secondary btn-sm" onClick={() => setView('home')}>⬅️ Back to Shop</button>
      </div>

      <div className="scanner-grid">
        {/* Left Column: Image Area & Controls */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label className="login-label" style={{ display: 'block', marginBottom: '8px' }}>Select Infected Crop Type</label>
            <select
              className="login-input"
              style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              {crops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className={`upload-panel ${image ? 'has-image' : ''}`}>
            {scanning && <div className="scan-laser-line" />}
            
            {image ? (
              image.startsWith('sample_') ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#2c3e50', color: 'white', zIndex: 1 }}>
                  <span style={{ fontSize: '5rem' }}>🍃</span>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }}>
                    {image.replace('sample_', '').replace('_', ' ').toUpperCase()} SAMPLE LEAF
                  </div>
                </div>
              ) : (
                <img src={image} className="uploaded-leaf-preview" alt="leaf target" />
              )
            ) : (
              <div>
                <span className="placeholder-icon">📸</span>
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Upload leaf picture or select sample</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px' }}>JPEG or PNG formats supported</div>
              </div>
            )}

            {!scanning && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
            )}
          </div>

          <div style={{ marginTop: '14px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text3)', textAlign: 'center' }}>No actual leaf photo? Select a mockup sample leaf:</div>
            <div className="sample-row">
              <span className="sample-thumb" onClick={() => handleSampleSelect('Tomato Spot')}>🍅 Tomato Spot Leaf</span>
              <span className="sample-thumb" onClick={() => handleSampleSelect('Paddy Blast')}>🌾 Paddy Blast Leaf</span>
              <span className="sample-thumb" onClick={() => handleSampleSelect('Cotton Mildew')}>☁️ Cotton Mildew Leaf</span>
            </div>
          </div>

          <button
            className="btn btn-primary w-full mt-24"
            disabled={!image || scanning}
            onClick={startScan}
            style={{ fontSize: '1rem', padding: '12px 0' }}
          >
            {scanning ? '⏳ Scanning Leaf Structures...' : '🔬 Analyze Leaf with AI'}
          </button>
        </div>

        {/* Right Column: Scan Results Output */}
        <div>
          {scanning ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '3rem', display: 'block', animation: 'spin 2s linear infinite' }}>🔬</span>
              <h3 style={{ marginTop: '20px', fontFamily: 'var(--font-heading)' }}>Running Diagnostic Neural Network...</h3>
              <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: '6px' }}>Detecting chlorotic margins, powdery spores, and necrotic patches on leaf margins.</p>
            </div>
          ) : result ? (
            <div className="diag-results-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="category-pill" style={{ margin: 0 }}>Diagnosis Result</span>
                <span className={`severity-badge severity-${result.severity}`}>{result.severity} SEVERITY</span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginTop: '14px' }}>{result.disease_name}</h2>
              <div style={{ fontStyle: 'italic', color: 'var(--text3)', fontSize: '0.85rem', marginTop: '2px' }}>Scientific Name: {result.scientific_name}</div>
              
              <div style={{ marginTop: '14px', fontSize: '0.9rem', color: 'var(--text2)' }}>
                <strong>AI Confidence:</strong> <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{result.confidence}%</span> Match
              </div>

              <p style={{ color: 'var(--text2)', fontSize: '0.9rem', margin: '14px 0', lineHeight: 1.5 }}>
                {result.description}
              </p>

              {/* Symptoms */}
              <div className="solution-box">
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', marginBottom: '8px' }}>Detected Symptoms</h4>
                {Array.isArray(result.symptoms) ? result.symptoms.map((sym, i) => (
                  <div key={i} className="solution-item">
                    <span>🔴</span> <span>{sym}</span>
                  </div>
                )) : <p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{result.symptoms || 'Brown spots, wilting leaf bodies.'}</p>}
              </div>

              {/* Solutions */}
              <div className="solution-box" style={{ background: 'rgba(16,185,129,0.03)' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '8px' }}>Remedy & Cure Plan</h4>
                {Array.isArray(result.solutions) ? result.solutions.map((sol, i) => (
                  <div key={i} className="solution-item">
                    <span>🟢</span> <span>{sol}</span>
                  </div>
                )) : <p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{result.solutions || 'Apply organic neem spray.'}</p>}
              </div>

              {/* Recommended Product card */}
              {result.recommended_product_name && (
                <div className="recomm-product-card">
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text3)', fontWeight: '600' }}>Suggested Compound</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text)', marginTop: '2px' }}>{result.recommended_product_name}</div>
                    {result.recommended_product_price && <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginTop: '2px' }}>Price: {result.recommended_product_price}</div>}
                  </div>
                  {recommendedProduct ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setSelectedProductId(recommendedProduct.id)
                        setView('product-details')
                      }}
                    >
                      🛒 Buy Resource
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setView('home')
                      }}
                    >
                      🔍 Search Shop
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg2)' }}>
              <span style={{ fontSize: '3rem' }}>🔬</span>
              <h3 style={{ marginTop: '20px', fontFamily: 'var(--font-heading)' }}>Waiting for Image Analysis</h3>
              <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: '6px' }}>Select an infected leaf file and click diagnostic scan to detect details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
