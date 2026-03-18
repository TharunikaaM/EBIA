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

  const navigate = useNavigate();
  const location = useLocation();

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
        .catch(() => {});
    }
  }, []);

  const pollStatus = useCallback(async (taskId) => {
    const msgs = ['Scanning market signals…', 'Finding your competitors…', 'Scoring your idea…', 'Building your report…'];
    let i = 0;
    const iv = setInterval(async () => {
      try {
        const res = await api.get(`/api/v1/idea/status/${taskId}`);
        if (res.data.status === 'COMPLETED') {
          clearInterval(iv);
          setEvaluation(res.data.results);
          setEvaluationId(res.data.id);
          setIsLoading(false);
          navigate('/evaluation');
        } else if (res.data.status === 'FAILED') {
          clearInterval(iv);
          setIsLoading(false);
          toast.error('Something went wrong. Please try again.');
        } else {
          setLoadingMsg(msgs[i++ % msgs.length]);
        }
      } catch {
        clearInterval(iv);
        setIsLoading(false);
        toast.error('Lost connection to server.');
      }
    }, 3000);
  }, []);

  const handleEvaluate = useCallback(async () => {
    if (!ideaInput || ideaInput.length < 10) return toast.error('Tell us a bit more about your idea!');
    setIsLoading(true);
    setGeneratedIdeas(null);
    try {
      const res = await api.post('/api/v1/idea/evaluate', { idea: ideaInput, is_private: isPrivate });
      pollStatus(res.data.task_id);
    } catch (err) {
      setIsLoading(false);
      toast.error(err.response?.data?.detail || 'Could not connect to the server.');
    }
  }, [ideaInput, isPrivate, pollStatus]);

  const handleGenerate = useCallback(async () => {
    if (!domain) return toast.error('Tell us what domain you want to explore!');
    setIsLoading(true);
    setEvaluation(null);
    try {
      const res = await api.post('/api/v1/idea/generate', {
        business_type: domain, // Backend expects business_type
        location: targetLocation || 'Global', // Backend expects location
        budget: budgetRange || 'Bootstrapped' // Backend expects budget
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
  }, [domain, targetLocation, budgetRange, api, navigate]);

  const handleSendMessage = async (msg) => {
    if (!evaluationId) {
      toast.error("No active evaluation to discuss.");
      return Promise.reject("No evaluation");
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

  useEffect(() => {
    if (location.pathname === '/history') fetchHistory();
  }, [location.pathname]);

  const primaryFromLanding = () => {
    if (landingMode === 'analyze') {
      handleEvaluate();
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
              />
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
              setFounderConstraints={() => {}}
              workspaceQuery={workspaceQuery}
              setWorkspaceQuery={setWorkspaceQuery}
              ideas={generatedIdeas?.ideas || generatedIdeas || []}
              onAnalyzeIdea={(idea) => {
                setIdeaInput(idea.description || idea.title || '');
                setLandingMode('analyze');
                navigate('/analyze');
              }}
              onRefineIdeas={() => {
                setLandingMode('generate');
                navigate('/analyze');
              }}
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
                  : [{ role: 'assistant', content: "I've reviewed your evaluation. What would you like to refine for feasibility and market fit?" }]
              }
              isChatTyping={isChatTyping}
              onDiscuss={handleSendMessage}
            />
          }
        />
        <Route
          path="/history"
          element={<HistoryPage historyList={historyList} onOpen={(item) => {
            setEvaluation(item.analysis_results || item.evaluation || null);
            setEvaluationId(item.id || item.evaluation_id || null);
            navigate('/evaluation');
          }} />}
        />
        <Route path="/profile" element={<ProfilePage user={user} theme={theme} setTheme={setTheme} />} />
        <Route path="*" element={<Navigate to="/analyze" replace />} />
      </Routes>
    </PageShell>
  );
}
