import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import PageShell from './components/layout/PageShell';
import AppHeader from './components/layout/AppHeader';

import LandingPage from './pages/LandingPage';
import GeneratePage from './pages/GeneratePage';
import GeneratedResultsPage from './pages/GeneratedResultsPage';
import EvaluationPage from './pages/EvaluationPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import LoadingPage from './pages/LoadingPage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [user] = useState({ name: 'Guest User', email: 'guest@local' });
  const [apiConnected, setApiConnected] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [savedIdeas, setSavedIdeas] = useState([]);

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ebia_theme') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ebia_theme', theme);
  }, [theme]);

  // Landing / analyze
  const [landingMode, setLandingMode] = useState('analyze'); // analyze | generate
  const [ideaInput, setIdeaInput] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [pivotPanelEnabled, setPivotPanelEnabled] = useState(false);

  // Workspace (generate)
  const [workspaceQuery, setWorkspaceQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [businessModel, setBusinessModel] = useState('');

  // Evaluation / generation results
  const [evaluation, setEvaluation] = useState(null);
  const [generatedIdeas, setGeneratedIdeas] = useState(null);
  const [evaluationId, setEvaluationId] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState('Scanning market signals…');

  // Chat state (embedded below evaluation)
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Step-based Generation
  const [genStep, setGenStep] = useState(1); // 1 = SaaS/Non-SaaS, 2 = Details
  const [genType, setGenType] = useState('SaaS'); // SaaS | Non-SaaS

  // Same-page analysis results
  const [isEvaluationVisible, setIsEvaluationVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Reset evaluation when idea changes
  useEffect(() => {
    if (ideaInput.length === 0) setIsEvaluationVisible(false);
  }, [ideaInput]);

  // Axios
  const api = useMemo(() => axios.create({ baseURL: API_BASE_URL }), []);
  useEffect(() => {
    const id = api.interceptors.request.use((cfg) => {
      const token = localStorage.getItem('ebia_token');
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      return cfg;
    });
    return () => api.interceptors.request.eject(id);
  }, [api]);

  useEffect(() => {
    api.get('/').then(() => setApiConnected(true)).catch(() => setApiConnected(false));
    const existing = localStorage.getItem('ebia_token');
    if (!existing) {
      axios.post(`${API_BASE_URL}/api/v1/auth/guest`)
        .then(r => { if (r.data?.access_token) localStorage.setItem('ebia_token', r.data.access_token); })
        .catch(() => { });
    }
  }, []);

  const pollStatus = useCallback(async (taskId) => {
    const msgs = ['Scanning market signals…', 'Finding your competitors…', 'Scoring your idea…', 'Building your roadmap…'];
    let i = 0;
    const iv = setInterval(async () => {
      try {
        const res = await api.get(`/api/v1/idea/status/${taskId}`);
        if (res.data.status === 'COMPLETED') {
          clearInterval(iv);
          setEvaluation(res.data.results);
          setEvaluationId(res.data.id);
          setIsLoading(false);
          setIsEvaluationVisible(true);
          navigate('/evaluation');
        } else if (res.data.status === 'FAILED') {
          clearInterval(iv);
          setIsLoading(false);
          toast.error('Something went wrong. Please try again.');
        } else {
          // Show the actual status from the backend if it's informative
          if (res.data.status && res.data.status !== 'PENDING') {
            setLoadingMsg(`${res.data.status}…`);
          } else {
            setLoadingMsg(msgs[i++ % msgs.length]);
          }
        }
      } catch {
        clearInterval(iv);
        setIsLoading(false);
        toast.error('Lost connection to server.');
      }
    }, 3000);
  }, [api]);

  const handleEvaluate = useCallback(async () => {
    if (!ideaInput || ideaInput.length < 10) return toast.error('Tell us a bit more about your idea!');
    setIsLoading(true);
    setGeneratedIdeas(null);
    setIsEvaluationVisible(false);
    setChatMessages([]);
    try {
      const res = await api.post('/api/v1/idea/evaluate', {
        idea: ideaInput,
        is_private: isPrivate,
        domain: domain,
        location: targetLocation,
        budget: budgetRange
      });
      pollStatus(res.data.task_id);
    } catch (err) {
      setIsLoading(false);
      toast.error(err.response?.data?.detail || 'Could not connect to the server.');
    }
  }, [ideaInput, isPrivate, pollStatus, api]);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setEvaluation(null);
    setIsEvaluationVisible(false);

    // Construct better business_type based on selection
    const finalType = genType === 'SaaS' ? `SaaS Platform for ${domain}` : `${domain} (Physical/Local Business)`;

    try {
      const res = await api.post('/api/v1/idea/generate', {
        business_type: finalType,
        location: targetLocation || 'Global',
        budget: budgetRange || 'Flexible'
      });
      setGeneratedIdeas(res.data);
      setIsLoading(false);
      toast.success('Your ideas are ready!');
      navigate('/generate/results');
    } catch (err) {
      console.error("Generation Error:", err);
      setIsLoading(false);
      toast.error(err.response?.data?.detail || 'Generation failed. Please check your inputs.');
    }
  }, [domain, targetLocation, budgetRange, genType, api, navigate]);

  const handleSendMessage = async (msg) => {
    if (!evaluationId) {
      toast.error("I need a moment to lock in your evaluation ID! If this persists, please re-analyze your idea. 🛡️");
      return Promise.reject("No evaluationId");
    }
    const newMessages = [...chatMessages, { role: 'user', content: msg }];
    setChatMessages(newMessages);
    setIsChatTyping(true);
    return api.post(`/api/v1/chat/${evaluationId}`, { message: msg })
      .then(res => {
        setChatMessages([...newMessages, { role: 'assistant', content: res.data.response }]);
        return res.data;
      })
      .catch(err => {
        toast.error("Advice disconnected.");
        throw err;
      })
      .finally(() => {
        setIsChatTyping(false);
      });
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/v1/history');
      setHistoryList(res.data);
    } catch { toast.error('Could not load your history.'); }
  };

  const deleteHistoryItem = async (id) => {
    try {
      await api.delete(`/api/v1/history/${id}`);
      setHistoryList(prev => prev.filter(h => h.id !== id));
    } catch { toast.error('Could not delete entry.'); }
  };

  const deleteMultipleHistoryItems = async (ids) => {
    try {
      await api.post('/api/v1/history/delete-multiple', ids);
      setHistoryList(prev => prev.filter(h => !ids.includes(h.id)));
      toast.success(`${ids.length} entries removed. 🛡️`);
    } catch { toast.error('Could not delete selected items.'); }
  };

  const clearAllHistory = async () => {
    try {
      await api.delete('/api/v1/history/');
      setHistoryList([]);
      toast.success('Your entire history has been cleared. 🛡️');
    } catch { toast.error('Could not clear history.'); }
  };

  const fetchSavedIdeas = async () => {
    try {
      const res = await api.get('/api/v1/saved-ideas');
      setSavedIdeas(res.data);
    } catch { toast.error('Could not load saved ideas.'); }
  };

  const handleSaveIdea = async (idea) => {
    try {
      await api.post('/api/v1/saved-ideas', {
        title: idea.title,
        content: idea
      });
      fetchSavedIdeas();
      toast.success('Idea saved to your profile! ✨');
    } catch (err) {
      toast.error('Could not save idea.');
    }
  };

  const handleDeleteSavedIdea = async (id) => {
    try {
      await api.delete(`/api/v1/saved-ideas/${id}`);
      setSavedIdeas(prev => prev.filter(i => i.id !== id));
      toast.success('Idea removed.');
    } catch { toast.error('Could not remove idea.'); }
  };

  useEffect(() => {
    if (location.pathname === '/history') fetchHistory();
    if (location.pathname === '/profile') fetchSavedIdeas();
  }, [location.pathname]);

  const primaryFromLanding = () => {
    if (landingMode === 'analyze') {
      handleEvaluate();
      return;
    }
    if (genStep === 1) {
      setGenStep(2);
      return;
    }
    handleGenerate();
  };

  return (
    <PageShell>
      <Toaster position="top-center" />
      <AppHeader />
      <Routes>
        <Route path="/" element={<Navigate to="/analyze" replace />} />
        <Route
          path="/analyze"
          element={
            isLoading ? (
              <LoadingPage message={loadingMsg} />
            ) : (
              <div className="space-y-12">
                <LandingPage
                  ideaInput={ideaInput}
                  setIdeaInput={setIdeaInput}
                  mode={landingMode}
                  setMode={setLandingMode}
                  isPrivate={isPrivate}
                  setIsPrivate={setIsPrivate}
                  domain={domain}
                  setDomain={setDomain}
                  location={targetLocation}
                  setLocation={setTargetLocation}
                  budget={budgetRange}
                  setBudget={setBudgetRange}
                  businessModel={businessModel}
                  setBusinessModel={setBusinessModel}
                  onPrimaryAction={primaryFromLanding}
                  genStep={genStep}
                  setGenStep={setGenStep}
                  genType={genType}
                  setGenType={setGenType}
                />
              </div>
            )
          }
        />
        <Route
          path="/generate/results"
          element={
            <GeneratedResultsPage
              founderConstraints={{
                domain: domain || 'Agri-Tech',
                location: targetLocation || 'Singapore',
                budget: budgetRange || '<$50k',
              }}
              setFounderConstraints={() => { }}
              workspaceQuery={workspaceQuery}
              setWorkspaceQuery={setWorkspaceQuery}
              ideas={generatedIdeas?.ideas || generatedIdeas || []}
              onAnalyzeIdea={(idea) => {
                setIdeaInput(idea.description || idea.title || '');
                setLandingMode('analyze');
                navigate('/analyze');
              }}
              onRefineIdeas={() => {
                setGenStep(1);
                setLandingMode('generate');
                navigate('/analyze');
              }}
              onRegenerate={handleGenerate}
              isPrivate={isPrivate}
              setIsPrivate={setIsPrivate}
            />
          }
        />
        <Route
          path="/evaluation"
          element={
            <EvaluationPage
              isPrivate={isPrivate}
              setIsPrivate={setIsPrivate}
              evaluation={evaluation}
              chatMessages={
                chatMessages.length
                  ? chatMessages
                  : [{ role: 'assistant', content: "I've reviewed your evaluation. What would you like to refine?" }]
              }
              isChatTyping={isChatTyping}
              onDiscuss={handleSendMessage}
            />
          }
        />
        <Route
          path="/advisor"
          element={
            <EvaluationPage
              isPrivate={isPrivate}
              setIsPrivate={setIsPrivate}
              evaluation={evaluation}
              chatMessages={
                chatMessages.length
                  ? chatMessages
                  : [{ role: 'assistant', content: "### Welcome to your Idea Strategy Room! 🚀\n\nI've just finished a deep dive into your evaluation. We've got some **exciting potential** here, but also some key areas where we can sharpen the edge. 🛠️\n\nWhat would you like to brainstorm first? We could talk about **scaling your revenue**, **crushing the competition**, or **refining your target audience**. I'm ready when you are! ✨" }]
              }
              isChatTyping={isChatTyping}
              onDiscuss={handleSendMessage}
            />
          }
        />
        <Route
          path="/history"
          element={<HistoryPage
            historyList={historyList}
            onOpen={(item) => {
              setEvaluation(item.analysis_results || item.evaluation || null);
              setEvaluationId(item.id || item.evaluation_id || null);
              setChatMessages([]);
              navigate('/evaluation');
            }}
            onDelete={deleteHistoryItem}
            onDeleteMultiple={deleteMultipleHistoryItems}
            onClearAll={clearAllHistory}
          />}
        />
        <Route path="/profile" element={
          <ProfilePage
            user={user}
            theme={theme}
            setTheme={setTheme}
            savedIdeas={savedIdeas}
            onDeleteIdea={handleDeleteSavedIdea}
            onAnalyzeIdea={(idea) => {
              setIdeaInput(idea.description || idea.title || '');
              setLandingMode('analyze');
              navigate('/analyze');
            }}
          />
        } />
        <Route path="*" element={<Navigate to="/analyze" replace />} />
      </Routes>
    </PageShell>
  );
}
