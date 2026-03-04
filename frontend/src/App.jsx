import React, { useState, useEffect, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import {
  BrainCircuit, MessageSquare, History, Settings, Sparkles,
  AlertTriangle, TrendingUp, Coins, ArrowLeft, Download, Zap,
  PlusCircle, MinusCircle, User, Edit3, Lock, Send, X, ShieldAlert
} from 'lucide-react';
import './index.css';

const API_URL_EVAL = 'http://localhost:8000/api/v1/idea/evaluate';
const API_URL_GEN = 'http://localhost:8000/api/v1/idea/generate';
const API_URL_CHAT = 'http://localhost:8000/api/v1/chat';
const API_URL_AUTH_GOOGLE = 'http://localhost:8000/api/v1/auth/google';
const API_URL_AUTH_GUEST = 'http://localhost:8000/api/v1/auth/guest';

function App() {
  const [apiConnected, setApiConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('evaluate');
  const [stage, setStage] = useState('input');

  const [ideaInput, setIdeaInput] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [genBiz, setGenBiz] = useState('');
  const [genLoc, setGenLoc] = useState('');
  const [genBudget, setGenBudget] = useState('');

  const [resultData, setResultData] = useState(null);
  const [activeTab, setActiveTab] = useState('trends');
  const [loadingText, setLoadingText] = useState("Analyzing your idea...");
  const [scoreAnimation, setScoreAnimation] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState('');

  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const chatEndRef = useRef(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [authLoading, setAuthLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google token received:", tokenResponse);
      setAuthLoading(true);
      try {
        const res = await fetch(API_URL_AUTH_GOOGLE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.credential || tokenResponse.access_token })
        });
        if (res.ok) {
          const authData = await res.json();
          setUser(authData.user_info);
          setShowLoginModal(false);
          // With real auth, we need to pass the new user_id to the pending actions
          if (pendingAction === 'evaluate') handleEvaluate(false, true, authData.user_info.id);
          if (pendingAction === 'generate') handleGenerate(true, authData.user_info.id);
        } else {
          const errorData = await res.json();
          alert(`Login failed: ${errorData.detail || "Unknown error"}`);
        }
      } catch (err) {
        console.error("Login exchange failed", err);
        alert("Could not connect to authentication server.");
      } finally {
        setAuthLoading(false);
      }
    },
    onError: errorResponse => {
      console.error("Google Login Error:", errorResponse);
      alert("Google Sign-In was unsuccessful.");
    },
  });

  const handleLogout = () => {
    setUser(null);
    setResultData(null);
    setStage('input');
    setShowUserMenu(false);
  };

  const guestLogin = async () => {
    try {
      const res = await fetch(API_URL_AUTH_GUEST, { method: 'POST' });
      if (res.ok) {
        const authData = await res.json();
        setUser(authData.user_info);
        setShowLoginModal(false);
        if (pendingAction === 'evaluate') handleEvaluate(false, true, authData.user_info.id);
        if (pendingAction === 'generate') handleGenerate(true, authData.user_info.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { checkApiStatus(); }, []);

  useEffect(() => {
    if (stage === 'results' && resultData) {
      let current = 0; const target = resultData.feasibility_score;
      const interval = setInterval(() => {
        current += 2; if (current >= target) { current = target; clearInterval(interval); }
        setScoreAnimation(current);
      }, 20);
      return () => clearInterval(interval);
    }
  }, [stage, resultData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const checkApiStatus = async () => {
    try { setApiConnected((await fetch('http://localhost:8000/')).ok); }
    catch (e) { setApiConnected(false); }
  };

  const handleEvaluate = async (isReval = false, skipAuthCheck = false, forcedUserId = null) => {
    const currentUserId = forcedUserId || user?.id;
    if (!currentUserId && !skipAuthCheck) {
      setPendingAction('evaluate');
      setShowLoginModal(true);
      return;
    }

    const inputToEval = isReval ? editInput : ideaInput;
    if (inputToEval.trim().length < 10) { alert("Please enter more details."); return; }

    setStage('loading');
    setLoadingText(isReval ? "Re-evaluating idea..." : "Analyzing market data...");

    const payload = { idea: inputToEval, is_private: isPrivate };
    if (isReval && resultData?.idea_id) { payload.idea_id = resultData.idea_id; }

    try {
      const response = await fetch(API_URL_EVAL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUserId
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error((await response.json()).detail);
      const data = await response.json();
      setResultData(data);
      if (!isReval) setChatHistory([{ role: 'assistant', message: "I've evaluated your idea. Ask me anything to refine it further!" }]);
      setStage('results');
      setIsEditing(false);
    } catch (error) {
      alert(`Error: ${error.message}`);
      setStage('input');
    }
  };

  const handleGenerate = async (skipAuthCheck = false, forcedUserId = null) => {
    const currentUserId = forcedUserId || user?.id;
    if (!currentUserId && !skipAuthCheck) {
      setPendingAction('generate');
      setShowLoginModal(true);
      return;
    }

    if (!genBiz || !genLoc || !genBudget) { alert("Fill all parameters."); return; }
    setStage('loading'); setLoadingText("Synthesizing parameters...");
    try {
      const response = await fetch(API_URL_GEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUserId
        },
        body: JSON.stringify({ business_type: genBiz, location: genLoc, budget: genBudget })
      });
      if (!response.ok) throw new Error((await response.json()).detail);
      const data = await response.json();
      const evaluation = data.evaluation;
      evaluation._generated_idea_text = data.generated_idea;
      setResultData(evaluation);
      setIdeaInput(data.generated_idea);
      setChatHistory([{ role: 'assistant', message: "I generate and evaluated this new idea. We can refine it via chat!" }]);
      setStage('results');
    } catch (error) {
      alert(`Error: ${error.message}`); setStage('input');
    }
  };

  const startImprovementLoop = (action) => {
    if (!resultData) return;
    let improvementPrompt = "";
    if (action === 'differentiate') improvementPrompt = `How can I differentiate from ${resultData.competitor_overview.map(c => c.competitor_name).join(', ')}?`;
    if (action === 'derisk') improvementPrompt = `How do I mitigate these risks: ${resultData.risk_factors.join(', ')}?`;

    setChatMessage(improvementPrompt);
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim() || !resultData?.idea_id || !user?.id) return;
    const msg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', message: msg }]);

    try {
      const response = await fetch(`${API_URL_CHAT}/${resultData.idea_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id
        },
        body: JSON.stringify({ message: msg })
      });
      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { role: 'assistant', message: data.message }]);
      }
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'assistant', message: "Sorry, I ran into an error processing your message." }]);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--accent-success)';
    if (score >= 60) return 'var(--brand-primary)';
    if (score >= 40) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Highly Feasible';
    if (score >= 60) return 'Feasible';
    if (score >= 40) return 'High Risk';
    return 'Low Feasibility';
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon-wrap"><BrainCircuit className="logo-icon" /></div>
          <h1>EBIA</h1>
        </div>
        <p className="subtitle">AI Validation Engine</p>

        <div className="nav-menu">
          <button className="nav-item active"><MessageSquare size={18} /> <span>Workspace</span></button>
          <button className="nav-item"><History size={18} /> <span>History</span></button>
        </div>

        <div className="sidebar-footer">
          {user && (
            <div className="user-info-brief">
              <p className="user-name-label">{user.name || 'User'}</p>
              <p className="user-email-label">{user.email}</p>
            </div>
          )}
          <div className="status-indicator">
            <span className={`status-dot ${apiConnected ? 'online' : 'offline'}`}></span>
            {apiConnected ? 'Systems Operational' : 'Offline'}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            EBIA / <span className="highlight-text">Idea Workspace</span>
          </div>
          <div className="user-profile-area">
            {user ? (
              <div className="user-profile-wrap">
                <div className="avatar" onClick={() => setShowUserMenu(!showUserMenu)}>
                  {user.picture ? <img src={user.picture} alt="Avatar" /> : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                </div>
                {showUserMenu && (
                  <div className="user-dropdown glass-panel">
                    <p className="dropdown-info"><strong>{user.name}</strong></p>
                    <p className="dropdown-info">{user.email}</p>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item" onClick={handleLogout}><ArrowLeft size={16} /> Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <button className="secondary-btn small" onClick={() => setShowLoginModal(true)}>Sign In</button>
            )}
          </div>
        </header>

        <div className="workspace">
          {stage === 'input' && (
            <div className="input-flow-container animated-entry">
              <div className="hero-text">
                <h2 className="gradient-text">Validate Your Next Big Idea</h2>
                <p>AI-driven market gap analysis and risk assessment.</p>
              </div>

              <div className="mode-tabs">
                <button className={`mode-btn ${mode === 'evaluate' ? 'active' : ''}`} onClick={() => setMode('evaluate')}>Evaluate Existing</button>
                <button className={`mode-btn ${mode === 'generate' ? 'active' : ''}`} onClick={() => setMode('generate')}>Generate New</button>
              </div>

              {mode === 'evaluate' ? (
                <div className="input-card glass-panel modern-glow">
                  <div className="textarea-wrapper">
                    <textarea value={ideaInput} onChange={e => setIdeaInput(e.target.value)} placeholder="Describe your startup idea in detail..." rows={6} />
                  </div>
                  <div className="action-row">
                    <label className="privacy-toggle">
                      <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                      <Lock size={16} /> Secure Context
                    </label>
                    <button onClick={() => handleEvaluate(false)} className="primary-btn glow-btn">Initialize Evaluation <Sparkles size={18} /></button>
                  </div>
                </div>
              ) : (
                <div className="input-card glass-panel modern-glow">
                  <div className="form-grid">
                    <div className="form-group"><label>Industry / Vertical</label><input className="text-input" placeholder="e.g. Fintech, EdTech" value={genBiz} onChange={e => setGenBiz(e.target.value)} /></div>
                    <div className="form-group"><label>Target Market</label><input className="text-input" placeholder="e.g. NA, Europe, Global" value={genLoc} onChange={e => setGenLoc(e.target.value)} /></div>
                    <div className="form-group"><label>Funding Stage</label><input className="text-input" placeholder="e.g. Bootstrapped, Seed" value={genBudget} onChange={e => setGenBudget(e.target.value)} /></div>
                  </div>
                  <div className="action-row">
                    <label className="privacy-toggle">
                      <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                      <Lock size={16} /> Secure Context
                    </label>
                    <button onClick={() => handleGenerate(false)} className="primary-btn glow-btn">Generate & Analyze <Zap size={18} /></button>
                  </div>
                </div>
              )}
            </div>
          )}

          {stage === 'loading' && (
            <div className="loader-container">
              <div className="pulse-ring"></div>
              <div className="spinner"></div>
              <h3 className="gradient-text">Processing Parameters</h3>
              <p>{loadingText}</p>
            </div>
          )}

          {stage === 'results' && resultData && (
            <div className="workspace-layout animated-entry">

              <div className="results-panel">
                <div className="actions-header">
                  <button onClick={() => { setStage('input'); setResultData(null); }} className="secondary-btn small"><ArrowLeft size={16} /> New Eval</button>
                </div>

                <div className="dashboard-grid">
                  <div className="grid-item score-card glass-panel" style={{ '--card-glow': getScoreColor(resultData.feasibility_score) }}>
                    <h4>Confidence Score</h4>
                    <div className="score-display">
                      <svg viewBox="0 0 36 36" className="circular-chart" style={{ stroke: getScoreColor(resultData.feasibility_score) }}>
                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="circle" strokeDasharray={`${scoreAnimation}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <text x="18" y="20.5" className="percentage">{scoreAnimation}</text>
                      </svg>
                      <div className="score-label" style={{ color: getScoreColor(resultData.feasibility_score) }}>{getScoreLabel(resultData.feasibility_score)}</div>
                    </div>
                  </div>

                  <div className="grid-item text-card glass-panel col-span-2 relative-glow">
                    <h4>Core Abstraction</h4>
                    <p className="refined-idea">{resultData.problem_statement}</p>
                    <div className="tags-container" style={{ marginTop: '16px' }}>
                      <span className="tag primary">{resultData.extracted_features?.domain || "General"}</span>
                      {resultData.extracted_features?.target_users && <span className="tag secondary">{resultData.extracted_features.target_users}</span>}
                    </div>
                  </div>

                  <div className="grid-item text-card glass-panel col-span-3">
                    <h4>Key Differentiators</h4>
                    <ul className="chips-list">
                      {resultData.key_features?.map((f, i) => <li className="chip" key={i}>{f}</li>)}
                    </ul>
                  </div>

                  <div className="grid-item competitors-card glass-panel col-span-2">
                    <h4>Market Alternatives</h4>
                    <div className="competitors-list">
                      {resultData.competitor_overview?.map((comp, i) => (
                        <div className="competitor-item" key={i}>
                          <div className="competitor-name">{comp.competitor_name}</div>
                          <div className="competitor-stat strength"><PlusCircle size={14} style={{ color: 'var(--accent-success)' }} /> <span>{comp.strengths.join(', ')}</span></div>
                          <div className="competitor-stat weakness"><MinusCircle size={14} style={{ color: 'var(--accent-danger)' }} /> <span>{comp.weaknesses.join(', ')}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid-item market-card glass-panel">
                    <div className="tabs">
                      <button className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`} onClick={() => setActiveTab('trends')}>Trends</button>
                      <button className={`tab-btn ${activeTab === 'painpoints' ? 'active' : ''}`} onClick={() => setActiveTab('painpoints')}>Friction</button>
                      <button className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`} onClick={() => setActiveTab('risks')}>Risks</button>
                    </div>
                    <ul className="list-display highlight-list">
                      {activeTab === 'trends' && resultData.market_trends?.map((x, i) => <li key={i}>{x}</li>)}
                      {activeTab === 'painpoints' && resultData.user_pain_points?.map((x, i) => <li key={i}>{x}</li>)}
                      {activeTab === 'risks' && resultData.risk_factors?.map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>

                  <div className="grid-item edit-card glass-panel col-span-3 accent-border">
                    <div className="card-header-flex">
                      <h4><Edit3 size={18} /> Iterate & Re-evaluate</h4>
                      <button className="icon-btn" onClick={() => { setIsEditing(!isEditing); setEditInput(resultData.original_idea || ideaInput); }}>
                        {isEditing ? <X size={18} /> : <span style={{ fontSize: '12px', fontWeight: 600 }}>OPEN EDITOR</span>}
                      </button>
                    </div>
                    {isEditing && (
                      <div className="edit-box animated-entry">
                        <textarea className="text-input" value={editInput} onChange={e => setEditInput(e.target.value)} rows={4} />
                        <div className="action-row" style={{ marginTop: '12px', justifyContent: 'flex-end' }}>
                          <button className="primary-btn outline" onClick={() => handleEvaluate(true)}>Run Iteration <Zap size={16} /></button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              <div className="chat-panel glass-panel">
                <div className="chat-header">
                  <h4><MessageSquare size={16} className="text-brand" /> AI Strategist</h4>
                </div>
                <div className="chat-messages minimal-scrollbar">
                  {chatHistory.map((msg, i) => (
                    <div className={`chat-bubble ${msg.role}`} key={i}>
                      {msg.message}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="chat-suggestions minimal-scrollbar">
                  <span onClick={() => startImprovementLoop('differentiate')}>Differentiate</span>
                  <span onClick={() => startImprovementLoop('derisk')}>Mitigate Risks</span>
                </div>
                <div className="chat-input-row">
                  <input type="text" className="text-input chat-input" placeholder="Ask a follow-up..." value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }} />
                  <button className="primary-btn glow-btn chat-send" onClick={handleSendChat}><Send size={16} /></button>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Auth Modal Overlay */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="login-card glass-panel animated-entry modal-glow">
            <button className="close-btn" onClick={() => setShowLoginModal(false)}><X size={20} /></button>
            <div className="modal-icon-wrap"><ShieldAlert size={32} /></div>
            <h2 className="gradient-text">Authentication Required</h2>
            <p className="login-subtitle">Please sign in to run deep market analysis and save your configurations continuously.</p>

            <div className="login-actions">
              {authLoading ? (
                <div className="auth-loader-wrap">
                  <div className="spinner small"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <button className="primary-btn full-width google-btn" onClick={() => googleLogin()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                  </button>
                  <div className="divider"><span>or</span></div>
                  <button className="secondary-btn full-width" onClick={guestLogin}>
                    <User size={20} style={{ marginRight: '10px' }} /> Continue as Guest
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
