import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import {
  BrainCircuit,
  MessageSquare,
  History,
  Settings,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Coins,
  ArrowLeft,
  Download,
  Zap,
  PlusCircle,
  MinusCircle,
  LogIn,
  User
} from 'lucide-react';
import './index.css';

const API_URL_EVAL = `${import.meta.env.VITE_API_URL}/api/v1/idea/evaluate`;
const API_URL_GEN = `${import.meta.env.VITE_API_URL}/api/v1/idea/generate`;
const API_URL_AUTH_GOOGLE = `${import.meta.env.VITE_API_URL}/api/v1/auth/google`;
const API_URL_AUTH_GUEST = `${import.meta.env.VITE_API_URL}/api/v1/auth/guest`;

function App() {
  const [apiConnected, setApiConnected] = useState(false);
  const [user, setUser] = useState(null); // Auth state
  const [mode, setMode] = useState('evaluate'); // 'evaluate', 'generate', or 'history'
  const [stage, setStage] = useState('input'); // 'input', 'loading', 'results'
  const [historyList, setHistoryList] = useState([]);

  // Inputs
  const [ideaInput, setIdeaInput] = useState('');
  const [genBiz, setGenBiz] = useState('');
  const [genLoc, setGenLoc] = useState('');
  const [genBudget, setGenBudget] = useState('');

  // Results
  const [resultData, setResultData] = useState(null);
  const [activeTab, setActiveTab] = useState('trends'); // 'trends', 'painpoints', 'risks'
  const [loadingText, setLoadingText] = useState("Our AI is cross-referencing your idea against vector databases and extracting core features.");
  const [scoreAnimation, setScoreAnimation] = useState(0);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(API_URL_AUTH_GOOGLE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: "mock_token" }) // Using mock token for dev as requested
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user_info);
          if (data.access_token) {
            localStorage.setItem('ebia_token', data.access_token);
          }
        }
      } catch (err) {
        console.error("Login failed", err);
      }
    },
    onError: errorResponse => console.error(errorResponse),
  });

  const guestLogin = async () => {
    try {
      const res = await fetch(API_URL_AUTH_GUEST, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user_info);
        if (data.access_token) {
          localStorage.setItem('ebia_token', data.access_token);
        }
      }
    } catch (err) {
      console.error("Guest login failed", err);
      // Fallback for dev if backend isn't up
      setUser({ name: "Guest", email: "guest@local" });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setStage('input');
    setResultData(null);
    localStorage.removeItem('ebia_token');
  }

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('ebia_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
        setMode('history');
        setStage('input');
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  useEffect(() => {
    if (stage === 'results' && resultData) {
      // Simple count up animation
      let current = 0;
      const target = resultData.feasibility_score;
      const interval = setInterval(() => {
        current += 2;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setScoreAnimation(current);
      }, 20);
      return () => clearInterval(interval);
    }
  }, [stage, resultData]);

  const checkApiStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/`);
      setApiConnected(res.ok);
    } catch (e) {
      setApiConnected(false);
    }
  };

  const startImprovementLoop = (action) => {
    if (!resultData) return;
    let improvementPrompt = "";
    if (action === 'differentiate') improvementPrompt = `Improve Differentiation for: ${resultData.refined_idea}. Make it stand out from ${resultData.competitor_overview.map(c => c.competitor_name).join(', ')}`;
    if (action === 'derisk') improvementPrompt = `Reduce Risk for: ${resultData.refined_idea}. Address: ${resultData.risk_factors.join(', ')}`;
    if (action === 'practical') improvementPrompt = `Make More Practical: ${resultData.refined_idea}`;
    if (action === 'simplify') improvementPrompt = `Simplify Model for: ${resultData.refined_idea}`;

    setIdeaInput(improvementPrompt);
    setMode('evaluate');
    setStage('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card glass-panel">
          <div className="logo-container large">
            <BrainCircuit className="logo-icon animate-pulse" size={48} />
            <h1>EBIA</h1>
          </div>
          <h2>Evidence-Based Improvement Advisor</h2>
          <p className="login-subtitle">AI-powered startup idea validation and structured improvement</p>

          <div className="login-actions">
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
          </div>
        </div>
      </div>
    );
  }

  const handleEvaluate = async () => {
    if (ideaInput.trim().length < 10) {
      alert("Please enter a more detailed idea (at least 10 characters).");
      return;
    }

    setStage('loading');
    setLoadingText("Our AI is cross-referencing your idea against vector databases and extracting core features.");

    try {
      const token = localStorage.getItem('ebia_token');
      const response = await fetch(API_URL_EVAL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idea: ideaInput })
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error("Session expired. Please login again.");
        }
        const err = await response.json();
        throw new Error(err.detail || 'Failed to evaluate idea');
      }

      const data = await response.json();
      setResultData(data);
      setStage('results');
    } catch (error) {
      console.error("Evaluation error:", error);
      alert(`Error: ${error.message}\nMake sure the backend server (FastAPI) is running on port 8000.`);
      setStage('input');
    }
  };

  const handleGenerate = async () => {
    if (!genBiz || !genLoc || !genBudget) {
      alert("Please fill in all the parameters for generation.");
      return;
    }

    setStage('loading');
    setLoadingText("Synthesizing new idea parameters and cross-referencing trends...");

    try {
      const token = localStorage.getItem('ebia_token');
      const response = await fetch(API_URL_GEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          business_type: genBiz,
          location: genLoc,
          budget: genBudget
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error("Session expired. Please login again.");
        }
        const err = await response.json();
        throw new Error(err.detail || 'Failed to generate idea');
      }

      const data = await response.json();

      // Inject generated idea into evaluation object for shared rendering
      const evaluation = data.evaluation;
      evaluation._generated_idea_text = data.generated_idea;

      setResultData(evaluation);
      setStage('results');
    } catch (error) {
      console.error("Generation error:", error);
      alert(`Error: ${error.message}\nMake sure the backend server is running.`);
      setStage('input');
    }
  };

  const handleReset = () => {
    setIdeaInput('');
    setStage('input');
    setResultData(null);
    setScoreAnimation(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <BrainCircuit className="logo-icon" />
          <h1>EBIA</h1>
        </div>
        <p className="subtitle">Evidence-Based Improvement Advisor</p>

        <div className="nav-menu">
          <button
            className={`nav-item ${mode !== 'history' ? 'active' : ''}`}
            onClick={() => { setMode('evaluate'); setStage('input'); }}
          >
            <MessageSquare size={18} /> New Evaluation
          </button>
          <button
            className={`nav-item ${mode === 'history' ? 'active' : ''}`}
            onClick={fetchHistory}
          >
            <History size={18} /> History
          </button>
          <button className="nav-item"><Settings size={18} /> Settings</button>
          <button className="nav-item sign-out" onClick={handleLogout}><ArrowLeft size={18} /> Sign Out</button>
        </div>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <span className={`status-dot ${apiConnected ? 'online' : 'offline'}`}></span>
            {apiConnected ? 'API Connected' : 'API Disconnected'}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h2>Idea Evaluation Engine</h2>
          <div className="user-profile">
            <div className="avatar">U</div>
          </div>
        </header>

        <div className="workspace">
          {stage === 'input' && (
            <>
              {/* Mode Toggle */}
              <div className="mode-tabs">
                <button
                  className={`mode-btn ${mode === 'evaluate' ? 'active' : ''}`}
                  onClick={() => setMode('evaluate')}
                >
                  Evaluate Idea
                </button>
                <button
                  className={`mode-btn ${mode === 'generate' ? 'active' : ''}`}
                  onClick={() => setMode('generate')}
                >
                  Generate Idea
                </button>
              </div>

              <section className="input-section" id="inputSection">
                {mode === 'evaluate' ? (
                  <div className="input-card glass-panel" id="evaluateModeCard">
                    <h3>Describe your startup idea</h3>
                    <p>Be as descriptive as possible. Include the problem you are solving, target audience, and proposed solution.</p>

                    <div className="textarea-wrapper">
                      <textarea
                        value={ideaInput}
                        onChange={(e) => setIdeaInput(e.target.value)}
                        placeholder="e.g., An app that connects local farmers directly to high-end restaurants for daily fresh deliveries, reducing food waste and ensuring quality."
                        rows={5}
                      />
                    </div>

                    <div className="action-row">
                      <span className="char-count" style={{ color: ideaInput.length > 10 ? 'var(--text-muted)' : 'inherit' }}>
                        {ideaInput.length} characters
                      </span>
                      <button onClick={handleEvaluate} className="primary-btn">
                        <span>Evaluate Idea</span>
                        <Sparkles size={20} />
                      </button>
                    </div>
                  </div>
                ) : mode === 'generate' ? (
                  <div className="input-card glass-panel" id="generateModeCard">
                    <h3>Generate a Startup Idea</h3>
                    <p>Provide a few parameters, and our AI will generate and evaluate a tailored startup idea for you.</p>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Business Type</label>
                        <input
                          type="text"
                          className="text-input"
                          value={genBiz}
                          onChange={(e) => setGenBiz(e.target.value)}
                          placeholder="e.g., SaaS, Marketplace, EdTech"
                        />
                      </div>
                      <div className="form-group">
                        <label>Location / Target Market</label>
                        <input
                          type="text"
                          className="text-input"
                          value={genLoc}
                          onChange={(e) => setGenLoc(e.target.value)}
                          placeholder="e.g., Urban US, Global, Rural India"
                        />
                      </div>
                      <div className="form-group">
                        <label>Investment Budget</label>
                        <input
                          type="text"
                          className="text-input"
                          value={genBudget}
                          onChange={(e) => setGenBudget(e.target.value)}
                          placeholder="e.g., Bootstrapped, $10k-$50k, VC Funding"
                        />
                      </div>
                    </div>

                    <div className="action-row" style={{ justifyContent: 'flex-end' }}>
                      <button onClick={handleGenerate} className="primary-btn">
                        <span>Generate & Evaluate</span>
                        <Zap size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="history-section">
                    <h3>Evaluation History</h3>
                    <p>Access your previous startup idea evaluations and insights.</p>

                    {historyList.length === 0 ? (
                      <div className="empty-state glass-panel">
                        <History size={48} className="text-muted" />
                        <p>No history found. Start your first evaluation to see it here!</p>
                      </div>
                    ) : (
                      <div className="history-grid">
                        {historyList.map((item) => (
                          <div key={item.id} className="history-item glass-panel" onClick={() => {
                            setResultData(item.analysis_results);
                            setStage('results');
                            setMode('evaluate');
                          }}>
                            <div className="history-header">
                              <span className="date">{new Date(item.created_at).toLocaleDateString()}</span>
                              <span className="score" style={{ color: getScoreColor(item.analysis_results.feasibility_score) }}>
                                {item.analysis_results.feasibility_score}%
                              </span>
                            </div>
                            <div className="history-body">
                              <p className="idea-preview">{item.idea_text.substring(0, 100)}...</p>
                              <div className="domain-tag">{item.analysis_results.extracted_features.domain}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            </>
          )}

          {stage === 'loading' && (
            <section className="loading-section" id="loadingSection">
              <div className="loader-container">
                <div className="spinner"></div>
                <h3>Analyzing Market Data...</h3>
                <p>{loadingText}</p>
              </div>
            </section>
          )}

          {stage === 'results' && resultData && (
            <section className="results-section" id="resultsSection">
              <div className="dashboard-grid">

                {/* Feasibility Score */}
                <div className="grid-item score-card glass-panel">
                  <h4>Feasibility Score</h4>
                  <div className="score-display">
                    <svg viewBox="0 0 36 36" className="circular-chart" style={{ stroke: getScoreColor(resultData.feasibility_score) }}>
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle" strokeDasharray={`${scoreAnimation}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <text x="18" y="20.5" className="percentage">{scoreAnimation}</text>
                    </svg>
                    <div className="score-label" style={{ color: getScoreColor(resultData.feasibility_score) }}>
                      {getScoreLabel(resultData.feasibility_score)}
                    </div>
                  </div>
                </div>

                {/* Core Features */}
                <div className="grid-item features-card glass-panel col-span-2">
                  <h4>Core Abstraction</h4>
                  <p className="refined-idea">
                    {resultData._generated_idea_text ? (
                      <>
                        <strong>Generated Idea:</strong> {resultData._generated_idea_text}<br /><br />
                        <strong>Optimization:</strong> {resultData.refined_idea}
                      </>
                    ) : (
                      resultData.refined_idea
                    )}
                  </p>

                  <div className="tags-container">
                    <div className="tag-group">
                      <span className="tag-label">Domain</span>
                      <span className="tag primary">{resultData.extracted_features.domain}</span>
                    </div>
                    <div className="tag-group">
                      <span className="tag-label">Target Audience</span>
                      <span className="tag secondary">{resultData.extracted_features.target_users}</span>
                    </div>
                    <div className="tag-group">
                      <span className="tag-label">Core Problem</span>
                      <span className="tag tertiary">{resultData.extracted_features.core_problem}</span>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {(resultData.status === "warning_flags_present" || (resultData.ethical_flags && resultData.ethical_flags.length > 0)) && (
                  <div className="grid-item warnings-card col-span-3" id="warningsCard">
                    <h4><AlertTriangle size={16} /> Ethical Flags Detected</h4>
                    <ul>
                      {resultData.ethical_flags.map((flag, i) => <li key={i}>{flag}</li>)}
                    </ul>
                  </div>
                )}

                {/* Tabs for Market Data */}
                <div className="grid-item market-card glass-panel col-span-2">
                  <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`} onClick={() => setActiveTab('trends')}>Market Trends</button>
                    <button className={`tab-btn ${activeTab === 'painpoints' ? 'active' : ''}`} onClick={() => setActiveTab('painpoints')}>User Pain Points</button>
                    <button className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`} onClick={() => setActiveTab('risks')}>Risk Factors</button>
                  </div>
                  <div className="tab-content" id="tabContent">
                    <ul className="list-display">
                      {activeTab === 'trends' && resultData.market_trends.map((item, i) => <li key={i}>{item}</li>)}
                      {activeTab === 'painpoints' && resultData.user_pain_points.map((item, i) => <li key={i}>{item}</li>)}
                      {activeTab === 'risks' && resultData.risk_factors.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Competitors */}
                <div className="grid-item competitors-card glass-panel">
                  <h4>Top Competitors</h4>
                  <div className="competitors-list">
                    {resultData.competitor_overview.map((comp, i) => (
                      <div className="competitor-item" key={i}>
                        <div className="competitor-name">{comp.competitor_name}</div>
                        <div className="competitor-stat strength"><PlusCircle size={14} style={{ stroke: 'var(--accent-success)', marginRight: '4px' }} /> Strengths: {comp.strengths.join(', ')}</div>
                        <div className="competitor-stat weakness"><MinusCircle size={14} style={{ stroke: 'var(--accent-danger)', marginRight: '4px' }} /> Weaknesses: {comp.weaknesses.join(', ')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div className="grid-item strategy-card glass-panel col-span-2">
                  <h4><TrendingUp size={16} /> Improvement Steps</h4>
                  <ul className="steps-list">
                    {resultData.improvement_steps.map((step, i) => (
                      <li className="step-item" key={i}>
                        <div className="step-number">{i + 1}</div>
                        <div className="step-content">{step}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Monetization */}
                <div className="grid-item monetization-card glass-panel">
                  <h4><Coins size={16} /> Monetization Models</h4>
                  <ul className="chips-list">
                    {resultData.monetization_suggestions.map((model, i) => (
                      <li className="chip" key={i}>{model}</li>
                    ))}
                  </ul>
                </div>

                {/* Improvement Actions */}
                <div className="grid-item actions-card glass-panel col-span-3">
                  <h4><Sparkles size={16} /> Guided Improvement Options</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>Select an option to iterate and improve your idea based on the analysis above.</p>
                  <div className="improvement-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={() => startImprovementLoop('differentiate')} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>Differentiate vs Competitors</button>
                    <button onClick={() => startImprovementLoop('derisk')} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>Address Key Risks</button>
                    <button onClick={() => startImprovementLoop('simplify')} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>Simplify Core Model</button>
                  </div>
                </div>

              </div>

              <div className="actions-footer">
                <button onClick={handleReset} className="secondary-btn"><ArrowLeft size={16} /> Start New Evaluation</button>
                <button className="primary-btn outline"><Download size={16} /> Export Report</button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
