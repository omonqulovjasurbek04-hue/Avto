import React, { useEffect, useState } from 'react';

export function AdminPage() {
  const [adminTab, setAdminTab] = useState('scenarios'); // 'scenarios' | 'lessons' | 'validator' | 'stats'
  const [scenarios, setScenarios] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState(null);
  const [valReport, setValReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scenario Edit Modal State
  const [editingScenario, setEditingScenario] = useState(null);
  const [showScenarioModal, setShowScenarioModal] = useState(false);

  // Lesson Edit Modal State
  const [editingLesson, setEditingLesson] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/scenarios').then((res) => res.json()),
      fetch('/api/lessons').then((res) => res.json()),
      fetch('/api/admin/stats').then((res) => res.json()),
    ])
      .then(([scData, lesData, stData]) => {
        setScenarios(scData);
        setLessons(lesData);
        setStats(stData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load admin data', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAll();
  }, []);

  const runValidation = () => {
    fetch('/api/admin/validate')
      .then((res) => res.json())
      .then((data) => setValReport(data))
      .catch((err) => console.error('Failed to run validator', err));
  };

  const handleDeleteScenario = (id) => {
    if (!window.confirm(`Haqiqatan ham ${id} ssenariysini o'chirmoqchimisiz?`)) return;
    fetch(`/api/admin/scenarios/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => loadAll());
  };

  const handleDeleteLesson = (id) => {
    if (!window.confirm(`Haqiqatan ham ${id} darsligini o'chirmoqchimisiz?`)) return;
    fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => loadAll());
  };

  const handleSaveScenario = (e) => {
    e.preventDefault();
    const form = e.target;
    const scenarioData = {
      id: editingScenario?.id || form.sc_id.value || `sc-${Date.now()}`,
      scene: {
        type: form.sc_type.value || 'crossroads_4way',
      },
      topic: form.sc_topic.value || 'crossroads',
      question: {
        text: {
          uz: form.sc_q_uz.value,
          ru: form.sc_q_ru.value,
          en: form.sc_q_en.value,
        },
        correct: form.sc_correct.value || 'A',
        options: [
          { id: 'A', label: { uz: form.sc_opt_a.value } },
          { id: 'B', label: { uz: form.sc_opt_b.value } },
          { id: 'C', label: { uz: form.sc_opt_c.value } },
          { id: 'D', label: { uz: form.sc_opt_d?.value || '' } },
        ].filter((o) => o.label.uz),
      },
      resolution: {
        rule: {
          code: form.sc_rule_code.value || '13.1',
          text: { uz: form.sc_rule_text.value || '' },
        },
        order: ['player'],
      },
    };

    fetch('/api/admin/scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarioData),
    })
      .then((res) => res.json())
      .then(() => {
        setShowScenarioModal(false);
        setEditingScenario(null);
        loadAll();
      });
  };

  const handleSaveLesson = (e) => {
    e.preventDefault();
    const form = e.target;
    const lessonData = {
      id: editingLesson?.id || form.les_id.value || `lesson-${Date.now()}`,
      title: form.les_title.value,
      topic: form.les_topic.value,
      description: form.les_desc.value,
      ruleCode: form.les_rule.value,
      icon: form.les_icon.value || '📚',
      readTime: form.les_time.value || '10 daqiqa',
      sections: [
        {
          heading: form.les_sec_h1.value,
          content: form.les_sec_c1.value,
          signs: form.les_sec_s1.value ? form.les_sec_s1.value.split(',').map((s) => s.trim()) : [],
        },
      ].filter((s) => s.heading),
    };

    fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonData),
    })
      .then((res) => res.json())
      .then(() => {
        setShowLessonModal(false);
        setEditingLesson(null);
        loadAll();
      });
  };

  if (loading) {
    return <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Admin ma'lumotlari yuklanmoqda...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700 }}>⚙️ Admin Boshqaruv Paneli</h2>
          <p style={{ color: '#94a3b8', fontSize: 15, marginTop: 4 }}>
            Ssenariylar, darsliklar, engine diagnostikasi hamda kontent validator nazorati.
          </p>
        </div>
        <div className="admin-status-badge">
          <span>Engine: v{stats?.engineVersion || '1.0.0'}</span>
          <span>• DB: {stats?.dbMode || 'JSON'}</span>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="nav-tabs" style={{ width: 'fit-content' }}>
        <button
          className={`nav-tab ${adminTab === 'scenarios' ? 'active' : ''}`}
          onClick={() => setAdminTab('scenarios')}
        >
          🚦 Ssenariylar ({scenarios.length})
        </button>
        <button
          className={`nav-tab ${adminTab === 'lessons' ? 'active' : ''}`}
          onClick={() => setAdminTab('lessons')}
        >
          📖 Darsliklar ({lessons.length})
        </button>
        <button
          className={`nav-tab ${adminTab === 'validator' ? 'active' : ''}`}
          onClick={() => {
            setAdminTab('validator');
            if (!valReport) runValidation();
          }}
        >
          ✅ Engine Validator
        </button>
        <button
          className={`nav-tab ${adminTab === 'stats' ? 'active' : ''}`}
          onClick={() => setAdminTab('stats')}
        >
          📊 Tizim Statistikasi
        </button>
      </div>

      {/* TAB 1: SCENARIOS MANAGEMENT */}
      {adminTab === 'scenarios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Mavjud Ssenariylar / Savollar Ro'yxati</h3>
            <button
              className="btn-primary"
              onClick={() => {
                setEditingScenario(null);
                setShowScenarioModal(true);
              }}
            >
              + Yangi Ssenariy Qo'shish
            </button>
          </div>

          <div className="meta-card">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #26334d', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>ID</th>
                  <th style={{ padding: 12 }}>Ssenariy Turi</th>
                  <th style={{ padding: 12 }}>Mavzu</th>
                  <th style={{ padding: 12 }}>Savol Matni (UZ)</th>
                  <th style={{ padding: 12 }}>Tog'ri Javob</th>
                  <th style={{ padding: 12 }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((sc) => (
                  <tr key={sc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: 12, fontWeight: 700, color: '#3b82f6' }}>{sc.id}</td>
                    <td style={{ padding: 12 }}>{sc.type}</td>
                    <td style={{ padding: 12 }}>{sc.topic}</td>
                    <td style={{ padding: 12, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sc.question?.uz || 'Savol kiritilmagan'}
                    </td>
                    <td style={{ padding: 12, fontWeight: 700, color: '#10b981' }}>{sc.correct || 'A'}</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn-icon-sm"
                          onClick={() => {
                            setEditingScenario(sc);
                            setShowScenarioModal(true);
                          }}
                          title="Tahrirlash"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon-sm danger"
                          onClick={() => handleDeleteScenario(sc.id)}
                          title="O'chirish"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LESSONS MANAGEMENT */}
      {adminTab === 'lessons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>YHQ Nazariy Darsliklar Ro'yxati</h3>
            <button
              className="btn-primary"
              onClick={() => {
                setEditingLesson(null);
                setShowLessonModal(true);
              }}
            >
              + Yangi Darslik Qo'shish
            </button>
          </div>

          <div className="meta-card">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #26334d', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>ID</th>
                  <th style={{ padding: 12 }}>Sarlavha</th>
                  <th style={{ padding: 12 }}>Mavzu kodi</th>
                  <th style={{ padding: 12 }}>YHQ Bandi</th>
                  <th style={{ padding: 12 }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((les) => (
                  <tr key={les.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: 12, fontWeight: 700, color: '#3b82f6' }}>{les.id}</td>
                    <td style={{ padding: 12, fontWeight: 600 }}>{les.icon} {les.title}</td>
                    <td style={{ padding: 12 }}>{les.topic}</td>
                    <td style={{ padding: 12, color: '#f59e0b' }}>{les.ruleCode}</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn-icon-sm"
                          onClick={() => {
                            setEditingLesson(les);
                            setShowLessonModal(true);
                          }}
                          title="Tahrirlash"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon-sm danger"
                          onClick={() => handleDeleteLesson(les.id)}
                          title="O'chirish"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VALIDATOR & DIAGNOSTICS */}
      {adminTab === 'validator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Dart Engine & JSON Schema Validator Report</h3>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>
                Ssenariylarning deterministik rendering va to'qnashuv simulyatsiyasiga muvofiqligi.
              </p>
            </div>
            <button className="btn-primary" onClick={runValidation}>
              🔄 Diagnostikani Qayta Yurgizish
            </button>
          </div>

          {valReport ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div className="meta-card" style={{ padding: 16 }}>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>Jami Ssenariylar</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{valReport.total}</div>
                </div>
                <div className="meta-card" style={{ padding: 16 }}>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>Muvaffaqiyatli Validatsiyadan O'tdi</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{valReport.valid}</div>
                </div>
                <div className="meta-card" style={{ padding: 16 }}>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>Ogohlantirishlar (Warnings)</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{valReport.warnings}</div>
                </div>
              </div>

              <div className="meta-card">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #26334d', color: '#94a3b8', textAlign: 'left' }}>
                      <th style={{ padding: 12 }}>Ssenariy ID</th>
                      <th style={{ padding: 12 }}>Holat</th>
                      <th style={{ padding: 12 }}>Variantlar</th>
                      <th style={{ padding: 12 }}>Davomiyligi</th>
                      <th style={{ padding: 12 }}>Natija / Ogohlantirishlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valReport.scenarios?.map((res) => (
                      <tr key={res.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: 12, fontWeight: 700 }}>{res.id}</td>
                        <td style={{ padding: 12 }}>
                          {res.valid ? (
                            <span style={{ color: '#10b981', fontWeight: 600 }}>✅ Valid</span>
                          ) : (
                            <span style={{ color: '#ef4444', fontWeight: 600 }}>❌ Xato</span>
                          )}
                        </td>
                        <td style={{ padding: 12 }}>{res.optionCount || 0} ta</td>
                        <td style={{ padding: 12 }}>{res.duration ? `${res.duration}s` : '-'}</td>
                        <td style={{ padding: 12, color: res.warnings?.length ? '#f59e0b' : '#94a3b8' }}>
                          {res.warnings?.length ? res.warnings.join(', ') : 'Ideal (xatosiz)'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Validatsiya bajarilmoqda...</div>
          )}
        </div>
      )}

      {/* TAB 4: SYSTEM STATS */}
      {adminTab === 'stats' && (
        <div className="meta-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>Platforma Tizim Statistikasi</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            <div style={{ background: '#0b0f19', padding: 20, borderRadius: 12, border: '1px solid #26334d' }}>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Jami Ssenariylar (Savollar)</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>
                {stats?.scenariosCount}
              </div>
            </div>
            <div style={{ background: '#0b0f19', padding: 20, borderRadius: 12, border: '1px solid #26334d' }}>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Jami Darsliklar</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
                {stats?.lessonsCount}
              </div>
            </div>
            <div style={{ background: '#0b0f19', padding: 20, borderRadius: 12, border: '1px solid #26334d' }}>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Topshirilgan Test Urinishlari</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
                {stats?.userAnswersCount}
              </div>
            </div>
            <div style={{ background: '#0b0f19', padding: 20, borderRadius: 12, border: '1px solid #26334d' }}>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Topshirilgan Imtihonlar</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#8b5cf6', marginTop: 4 }}>
                {stats?.userExamsCount}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCENARIO EDIT MODAL */}
      {showScenarioModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
              {editingScenario ? `${editingScenario.id} - Ssenariyni Tahrirlash` : 'Yangi Ssenariy Qo\'shish'}
            </h3>
            <form onSubmit={handleSaveScenario} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {!editingScenario && (
                <div>
                  <label className="form-label">Ssenariy ID (masalan: sc-0006)</label>
                  <input name="sc_id" defaultValue="" className="form-input" placeholder="sc-0006" />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Ssenariy Turi (Scene Type)</label>
                  <select name="sc_type" defaultValue={editingScenario?.type || 'crossroads_4way'} className="form-input">
                    <option value="crossroads_4way">crossroads_4way</option>
                    <option value="t_junction">t_junction</option>
                    <option value="roundabout">roundabout</option>
                    <option value="straight_road">straight_road</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Mavzu (Topic)</label>
                  <select name="sc_topic" defaultValue={editingScenario?.topic || 'crossroads'} className="form-input">
                    <option value="crossroads">crossroads</option>
                    <option value="yol_belgilari">yol_belgilari</option>
                    <option value="speed_limits">speed_limits</option>
                    <option value="overtaking">overtaking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Savol Matni (Uzbek)</label>
                <textarea name="sc_q_uz" defaultValue={editingScenario?.question?.uz || ''} className="form-input" rows={2} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Savol Matni (Russian)</label>
                  <input name="sc_q_ru" defaultValue="" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Savol Matni (English)</label>
                  <input name="sc_q_en" defaultValue="" className="form-input" />
                </div>
              </div>

              <div>
                <label className="form-label">Javob Variant A</label>
                <input name="sc_opt_a" defaultValue="Birinchi bo'lib o'tadi" className="form-input" required />
              </div>
              <div>
                <label className="form-label">Javob Variant B</label>
                <input name="sc_opt_b" defaultValue="Yo'l berishi shart" className="form-input" required />
              </div>
              <div>
                <label className="form-label">Javob Variant C</label>
                <input name="sc_opt_c" defaultValue="To'xtab turishi kerak" className="form-input" />
              </div>
              <div>
                <label className="form-label">Javob Variant D</label>
                <input name="sc_opt_d" defaultValue="" className="form-input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">To'g'ri Javob Harfi (A/B/C/D)</label>
                  <input name="sc_correct" defaultValue={editingScenario?.correct || 'A'} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">YHQ Qoida kodi</label>
                  <input name="sc_rule_code" defaultValue={editingScenario?.ruleCode || '13.2'} className="form-input" />
                </div>
              </div>

              <div>
                <label className="form-label">Qoida Izohi</label>
                <input name="sc_rule_text" defaultValue="Tartibga solinmagan chorrahada o'ng qo'l qoidasi amal qiladi." className="form-input" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowScenarioModal(false)}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn-primary">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LESSON EDIT MODAL */}
      {showLessonModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
              {editingLesson ? 'Darslikni Tahrirlash' : 'Yangi Darslik Qo\'shish'}
            </h3>
            <form onSubmit={handleSaveLesson} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {!editingLesson && (
                <div>
                  <label className="form-label">Darslik ID (masalan: lesson-05)</label>
                  <input name="les_id" defaultValue="" className="form-input" placeholder="lesson-05" />
                </div>
              )}

              <div>
                <label className="form-label">Darslik Sarlavhasi</label>
                <input name="les_title" defaultValue={editingLesson?.title || ''} className="form-input" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Mavzu kodi (topic)</label>
                  <input name="les_topic" defaultValue={editingLesson?.topic || 'general'} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">YHQ Bandi</label>
                  <input name="les_rule" defaultValue={editingLesson?.ruleCode || 'YHQ 8-band'} className="form-input" required />
                </div>
              </div>

              <div>
                <label className="form-label">Tavsif (Description)</label>
                <textarea name="les_desc" defaultValue={editingLesson?.description || ''} className="form-input" rows={2} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Icon (Emoji)</label>
                  <input name="les_icon" defaultValue={editingLesson?.icon || '📚'} className="form-input" />
                </div>
                <div>
                  <label className="form-label">O'qish Vaqti</label>
                  <input name="les_time" defaultValue={editingLesson?.readTime || '10 daqiqa'} className="form-input" />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #26334d', paddingTop: 12 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Bo'lim 1 (Section 1)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input name="les_sec_h1" placeholder="Bo'lim sarlavhasi" defaultValue={editingLesson?.sections?.[0]?.heading || ''} className="form-input" />
                  <textarea name="les_sec_c1" placeholder="Bo'lim matni" defaultValue={editingLesson?.sections?.[0]?.content || ''} className="form-input" rows={2} />
                  <input name="les_sec_s1" placeholder="Yo'l belgilari (masalan: 2.1, 2.4)" defaultValue={editingLesson?.sections?.[0]?.signs?.join(', ') || ''} className="form-input" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowLessonModal(false)}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn-primary">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
