// pages/ContentManager.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { api } from '../api/client.js'

const SECTIONS = ['Mandi Prices', 'Crop Diagnostics', 'Weather Manager']

export default function ContentManager({ showToast }) {
  const [activeSec, setActiveSec] = useState('Mandi Prices')
  const [loading, setLoading] = useState(false)

  // Data states
  const [mandiList, setMandiList] = useState([])
  const [diseaseList, setDiseaseList] = useState([])
  const [weatherList, setWeatherList] = useState([])

  // Modal states
  const [mandiModal, setMandiModal] = useState(null) // { isEdit, data }
  const [diseaseModal, setDiseaseModal] = useState(null) // { isEdit, data }
  const [weatherModal, setWeatherModal] = useState(null) // { isEdit, data }

  // Loaders
  const loadMandi = async () => {
    try {
      const data = await api.getMandiPrices()
      setMandiList(data)
    } catch (e) { showToast(e.message, 'error') }
  }

  const loadDiseases = async () => {
    try {
      const data = await api.getCropDiseases()
      setDiseaseList(data)
    } catch (e) { showToast(e.message, 'error') }
  }

  const loadWeather = async () => {
    try {
      const data = await api.getWeatherForecasts()
      setWeatherList(data)
    } catch (e) { showToast(e.message, 'error') }
  }

  useEffect(() => {
    setLoading(true)
    const run = async () => {
      if (activeSec === 'Mandi Prices') await loadMandi()
      if (activeSec === 'Crop Diagnostics') await loadDiseases()
      if (activeSec === 'Weather Manager') await loadWeather()
      setLoading(false)
    }
    run()
  }, [activeSec])

  // Mandi handlers
  const handleSaveMandi = async (e) => {
    e.preventDefault()
    const form = e.target
    const payload = {
      crop_name: form.crop_name.value,
      variety: form.variety.value,
      min_price: parseFloat(form.min_price.value),
      max_price: parseFloat(form.max_price.value),
      price_change: parseFloat(form.price_change.value || 0),
      trend: form.trend.value,
      district: form.district.value,
    }
    try {
      if (mandiModal.isEdit) {
        await api.updateMandiPrice(mandiModal.data.id, payload)
        showToast('Mandi record updated!', 'success')
      } else {
        await api.addMandiPrice(payload)
        showToast('Mandi record created!', 'success')
      }
      loadMandi()
      setMandiModal(null)
    } catch (err) { showToast(err.message, 'error') }
  }

  const handleDeleteMandi = async (id, crop) => {
    if (!confirm(`Delete Mandi rate details for ${crop}?`)) return
    try {
      await api.deleteMandiPrice(id)
      showToast('Record deleted', 'success')
      loadMandi()
    } catch (err) { showToast(err.message, 'error') }
  }

  // Disease handlers
  const handleSaveDisease = async (e) => {
    e.preventDefault()
    const form = e.target
    const payload = {
      crop_name: form.crop_name.value,
      disease_name: form.disease_name.value,
      scientific_name: form.scientific_name.value,
      confidence: parseInt(form.confidence.value),
      severity: form.severity.value,
      description: form.description.value,
      symptoms: form.symptoms.value.split('\n').filter(Boolean),
      solutions: form.solutions.value.split('\n').filter(Boolean),
      recommended_product_name: form.recommended_product_name.value,
      recommended_product_price: form.recommended_product_price.value,
      recommended_product_category: form.recommended_product_category.value,
    }
    try {
      if (diseaseModal.isEdit) {
        await api.updateCropDisease(diseaseModal.data.id, payload)
        showToast('Diagnostic details updated!', 'success')
      } else {
        await api.addCropDisease(payload)
        showToast('New crop diagnosis added!', 'success')
      }
      loadDiseases()
      setDiseaseModal(null)
    } catch (err) { showToast(err.message, 'error') }
  }

  const handleDeleteDisease = async (id, name) => {
    if (!confirm(`Remove crop disease "${name}"?`)) return
    try {
      await api.deleteCropDisease(id)
      showToast('Diagnosis removed', 'success')
      loadDiseases()
    } catch (err) { showToast(err.message, 'error') }
  }

  // Weather handlers
  const handleSaveWeather = async (e) => {
    e.preventDefault()
    const form = e.target
    const payload = {
      day_name: form.day_name.value,
      temp: form.temp.value,
      condition_icon: form.condition_icon.value,
      is_alert: form.is_alert.checked ? 1 : 0,
      location: form.location.value,
      temp_celsius: parseInt(form.temp_celsius.value),
      condition_text: form.condition_text.value,
    }
    try {
      if (weatherModal.isEdit) {
        await api.updateWeatherForecast(weatherModal.data.id, payload)
        showToast('Weather details updated!', 'success')
      } else {
        await api.addWeatherForecast(payload)
        showToast('New weather forecast entry created!', 'success')
      }
      loadWeather()
      setWeatherModal(null)
    } catch (err) { showToast(err.message, 'error') }
  }

  const handleDeleteWeather = async (id, day) => {
    if (!confirm(`Delete forecast entry for ${day}?`)) return
    try {
      await api.deleteWeatherForecast(id)
      showToast('Forecast entry removed', 'success')
      loadWeather()
    } catch (err) { showToast(err.message, 'error') }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Platform Content Manager</h1>
          <p>Configure dynamic content databases for the mobile client screens</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Nav tabs */}
        <nav className="settings-nav">
          {SECTIONS.map(sec => (
            <button
              key={sec}
              className={`settings-nav-item${activeSec === sec ? ' active' : ''}`}
              onClick={() => setActiveSec(sec)}
            >
              {sec === 'Mandi Prices' && '🌾'} {sec === 'Crop Diagnostics' && '🩺'} {sec === 'Weather Manager' && '🌤️'}
              {' '}{sec}
            </button>
          ))}
        </nav>

        {/* Content detail */}
        <div className="settings-content">
          {activeSec === 'Mandi Prices' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3>Live Mandi Prices</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setMandiModal({ isEdit: false, data: {} })}>
                  ➕ Add Mandi Rate
                </button>
              </div>

              {loading ? (
                <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" /></div>
              ) : mandiList.length === 0 ? (
                <div className="table-empty">No Mandi rates found in database</div>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Crop Name</th>
                        <th>Variety</th>
                        <th>District</th>
                        <th>Min Price</th>
                        <th>Max Price</th>
                        <th>Change</th>
                        <th>Trend</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mandiList.map(item => (
                        <tr key={item.id}>
                          <td><strong>{item.crop_name}</strong></td>
                          <td>{item.variety}</td>
                          <td>{item.district}</td>
                          <td>₹{Number(item.min_price).toLocaleString('en-IN')}</td>
                          <td>₹{Number(item.max_price).toLocaleString('en-IN')}</td>
                          <td style={{ color: item.price_change >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                            {item.price_change >= 0 ? `+₹${item.price_change}` : `-₹${Math.abs(item.price_change)}`}
                          </td>
                          <td>
                            <span className={`badge ${
                              item.trend === 'HIGH' ? 'badge-green' : item.trend === 'LOW' ? 'badge-red' : 'badge-gray'
                            }`}>{item.trend}</span>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn btn-info btn-xs" onClick={() => setMandiModal({ isEdit: true, data: item })}>✏️</button>
                              <button className="btn btn-danger btn-xs" onClick={() => handleDeleteMandi(item.id, item.crop_name)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSec === 'Crop Diagnostics' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3>Crop Disease Catalog</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setDiseaseModal({ isEdit: false, data: {} })}>
                  ➕ Add Diagnosis
                </button>
              </div>

              {loading ? (
                <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" /></div>
              ) : diseaseList.length === 0 ? (
                <div className="table-empty">No disease records found in database</div>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Crop</th>
                        <th>Disease</th>
                        <th>Scientific Name</th>
                        <th>Severity</th>
                        <th>Confidence</th>
                        <th>Recommend Product</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diseaseList.map(item => (
                        <tr key={item.id}>
                          <td><strong>{item.crop_name}</strong></td>
                          <td>{item.disease_name}</td>
                          <td><em>{item.scientific_name}</em></td>
                          <td>
                            <span className={`badge ${
                              item.severity === 'CRITICAL' || item.severity === 'HIGH' ? 'badge-red' : item.severity === 'MEDIUM' ? 'badge-yellow' : 'badge-gray'
                            }`}>{item.severity}</span>
                          </td>
                          <td>{item.confidence}%</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.recommended_product_name || '—'}</div>
                            <div className="text-sm text-muted">{item.recommended_product_category} · {item.recommended_product_price}</div>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn btn-info btn-xs" onClick={() => setDiseaseModal({ isEdit: true, data: item })}>✏️</button>
                              <button className="btn btn-danger btn-xs" onClick={() => handleDeleteDisease(item.id, item.disease_name)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSec === 'Weather Manager' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3>Weather Forecasts</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setWeatherModal({ isEdit: false, data: {} })}>
                  ➕ Add Forecast
                </button>
              </div>

              {loading ? (
                <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" /></div>
              ) : weatherList.length === 0 ? (
                <div className="table-empty">No weather entries found in database</div>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Location</th>
                        <th>Day Name</th>
                        <th>Forecast Temp</th>
                        <th>Icon Desc</th>
                        <th>Live Temp</th>
                        <th>Live Cond</th>
                        <th>Alert</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weatherList.map(item => (
                        <tr key={item.id}>
                          <td>{item.location}</td>
                          <td><strong>{item.day_name}</strong></td>
                          <td>{item.temp}</td>
                          <td><code>{item.condition_icon}</code></td>
                          <td>{item.temp_celsius}°C</td>
                          <td>{item.condition_text}</td>
                          <td>{item.is_alert ? <span className="badge badge-red">Alert</span> : <span className="badge badge-gray">No</span>}</td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn btn-info btn-xs" onClick={() => setWeatherModal({ isEdit: true, data: item })}>✏️</button>
                              <button className="btn btn-danger btn-xs" onClick={() => handleDeleteWeather(item.id, item.day_name)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mandi Modal */}
      {mandiModal && (
        <div className="modal-overlay" onClick={() => setMandiModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{mandiModal.isEdit ? '✏️ Edit Mandi Price' : '➕ Add Mandi Price'}</h2>
              <button className="modal-close" onClick={() => setMandiModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveMandi}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Crop Name *</label>
                    <input className="form-input" name="crop_name" defaultValue={mandiModal.data.crop_name || ''} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Variety *</label>
                    <input className="form-input" name="variety" defaultValue={mandiModal.data.variety || ''} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">District *</label>
                    <input className="form-input" name="district" defaultValue={mandiModal.data.district || ''} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trend</label>
                    <select className="form-select" name="trend" defaultValue={mandiModal.data.trend || 'STABLE'}>
                      <option value="HIGH">High (Rising)</option>
                      <option value="STABLE">Stable</option>
                      <option value="LOW">Low (Falling)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Min Price (₹) *</label>
                    <input className="form-input" type="number" name="min_price" defaultValue={mandiModal.data.min_price || ''} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Price (₹) *</label>
                    <input className="form-input" type="number" name="max_price" defaultValue={mandiModal.data.max_price || ''} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price Change (₹)</label>
                    <input className="form-input" type="number" name="price_change" defaultValue={mandiModal.data.price_change || '0'} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setMandiModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disease Modal */}
      {diseaseModal && (
        <div className="modal-overlay" onClick={() => setDiseaseModal(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{diseaseModal.isEdit ? '✏️ Edit Diagnostic Rule' : '➕ Add Diagnostic Rule'}</h2>
              <button className="modal-close" onClick={() => setDiseaseModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveDisease}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Crop Family *</label>
                    <input className="form-input" name="crop_name" placeholder="e.g. Rice, Tomato" defaultValue={diseaseModal.data.crop_name || ''} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Disease Name *</label>
                    <input className="form-input" name="disease_name" placeholder="e.g. Early Blight" defaultValue={diseaseModal.data.disease_name || ''} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Scientific Name *</label>
                    <input className="form-input" name="scientific_name" placeholder="e.g. Alternaria solani" defaultValue={diseaseModal.data.scientific_name || ''} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confidence (%) *</label>
                    <input className="form-input" type="number" min="0" max="100" name="confidence" defaultValue={diseaseModal.data.confidence || '90'} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Severity Level</label>
                    <select className="form-select" name="severity" defaultValue={diseaseModal.data.severity || 'MEDIUM'}>
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rec Product Name</label>
                    <input className="form-input" name="recommended_product_name" defaultValue={diseaseModal.data.recommended_product_name || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rec Product Price</label>
                    <input className="form-input" name="recommended_product_price" placeholder="e.g. ₹850" defaultValue={diseaseModal.data.recommended_product_price || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rec Product Category</label>
                    <input className="form-input" name="recommended_product_category" placeholder="e.g. Pesticides" defaultValue={diseaseModal.data.recommended_product_category || ''} />
                  </div>
                  <div className="form-group form-full">
                    <label className="form-label">Description *</label>
                    <textarea className="form-textarea" name="description" defaultValue={diseaseModal.data.description || ''} required />
                  </div>
                  <div className="form-group form-full">
                    <label className="form-label">Symptoms * (one per line)</label>
                    <textarea className="form-textarea" rows={3} name="symptoms" placeholder="Symptom 1&#10;Symptom 2" defaultValue={Array.isArray(diseaseModal.data.symptoms) ? diseaseModal.data.symptoms.join('\n') : ''} required />
                  </div>
                  <div className="form-group form-full">
                    <label className="form-label">Solutions * (one per line)</label>
                    <textarea className="form-textarea" rows={3} name="solutions" placeholder="Solution 1&#10;Solution 2" defaultValue={Array.isArray(diseaseModal.data.solutions) ? diseaseModal.data.solutions.join('\n') : ''} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDiseaseModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weather Modal */}
      {weatherModal && (
        <div className="modal-overlay" onClick={() => setWeatherModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{weatherModal.isEdit ? '✏️ Edit Forecast Entry' : '➕ Add Forecast Entry'}</h2>
              <button className="modal-close" onClick={() => setWeatherModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveWeather}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Location (Default: Kumbakonam...)</label>
                    <input className="form-input" name="location" defaultValue={weatherModal.data.location || 'Kumbakonam, Tamil Nadu'} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Condition Text</label>
                    <input className="form-input" name="condition_text" placeholder="e.g. Sunny Interval" defaultValue={weatherModal.data.condition_text || 'Sunny Interval'} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Temp (Celsius) *</label>
                    <input className="form-input" type="number" name="temp_celsius" defaultValue={weatherModal.data.temp_celsius || '32'} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Forecast Day Name *</label>
                    <input className="form-input" name="day_name" placeholder="e.g. MON" defaultValue={weatherModal.data.day_name || ''} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Forecast Temperature *</label>
                    <input className="form-input" name="temp" placeholder="e.g. 21°" defaultValue={weatherModal.data.temp || ''} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Condition Icon *</label>
                    <select className="form-select" name="condition_icon" defaultValue={weatherModal.data.condition_icon || 'WbSunny'}>
                      <option value="WbSunny">Sunny (WbSunny)</option>
                      <option value="Cloud">Cloudy (Cloud)</option>
                      <option value="WbCloudy">Partial Cloudy (WbCloudy)</option>
                      <option value="Grain">Rainy (Grain)</option>
                    </select>
                  </div>
                  <div className="form-group flex items-center" style={{ marginTop: 24 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                      <input type="checkbox" name="is_alert" defaultChecked={weatherModal.data.is_alert ? true : false} />
                      Highlight as High Temp Alert
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setWeatherModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
