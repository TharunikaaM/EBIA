import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import PageShell from './components/layout/PageShell';
import AppHeader from './components/layout/AppHeader';
import LoginModal from './components/ui/LoginModal';
import ConceptPreview from './components/ui/ConceptPreview';

import LandingPage from './pages/LandingPage';
import GeneratedResultsPage from './pages/GeneratedResultsPage';
import EvaluationPage from './pages/EvaluationPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import LoadingPage from './pages/LoadingPage';
import PivotPage from './pages/PivotPage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Inner component so it can use useAuth
function AppInner() {
  const { isLoggedIn, user } = useAuth();

  const [apiConnected, setApiConnected] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [savedIdeas, setSavedIdeas] = useState([]);

  const [theme, setTheme] = useState(() => localStorage.getItem('ebia_theme') || 'light');
  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('ebia_theme', theme);
  }, [theme]);

  const [landingMode, setLandingMode] = useState('analyze');
  const [ideaInput, setIdeaInput] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const [domain, setDomain] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [businessModel, setBusinessModel] = useState('');

  const [evaluation, setEvaluation] = useState(null);
  const [generatedIdeas, setGeneratedIdeas] = useState(null);
  const [evaluationId, setEvaluationId] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState('Checking your idea...');

  const [chatMessages, setChatMessages] = useState([]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [genStep, setGenStep] = useState(1);
  const [genType, setGenType] = useState('SaaS');
  const [isEvaluationVisible, setIsEvaluationVisible] = useState(false);

  const [pivots, setPivots] = useState([]);
  const [pivotsLoading, setPivotsLoading] = useState(false);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, concept: null });
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [refusalModal, setRefusalModal] = useState({ open: false, reason: '' });

  // Login modal state — stores pending action to resume after login
  const [showLoginModal, setShowLoginModal] = useState(false);
  const pendingAction = useRef(null); // 'analyze' | 'generate'

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (ideaInput.length === 0) setIsEvaluationVisible(false);
  }, [ideaInput]);

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
  }, []);

  const pollStatus = useCallback(async (taskId) => {
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
          if (res.data.error) {
            setRefusalModal({ open: true, reason: res.data.error });
          } else {
            toast.error('Something went wrong. Please try again.');
          }
        } else {
          if (res.data.status && res.data.status !== 'PENDING') {
            setLoadingMsg(`${res.data.status}…`);
          }
        }
      } catch (err) {
        clearInterval(iv);
        setIsLoading(false);
        toast.error('Lost connection to server.');
      }
    }, 1500);
  }, [api, navigate]);

  const handlePreviewIdea = useCallback((idea) => {
    setPreviewModal({ isOpen: true, concept: idea });
  }, []);

  const handleFullAnalysis = useCallback((concept) => {
    setPreviewModal({ isOpen: false, concept: null });
    setSelectedConcept(concept);
    const parts = [];
    if (concept.title) parts.push(`Idea: ${concept.title}`);
    if (concept.description || concept.idea_description) parts.push(`Description: ${concept.description || concept.idea_description}`);
    if (concept.target_audience) parts.push(`Target Market: ${concept.target_audience}`);
    if (concept.revenue_model) parts.push(`Revenue Model: ${concept.revenue_model}`);
    if (concept.features && concept.features.length) parts.push(`Key Features: ${concept.features.join(', ')}`);
    const fullText = parts.length > 0 ? parts.join('\n') : (concept.idea_description || concept.title || "");
    setIdeaInput(fullText);
    setLandingMode('analyze');
    navigate('/analyze');
  }, [navigate]);

  const _doEvaluate = useCallback(async () => {
    if (!ideaInput || ideaInput.length < 100) return toast.error('Please describe your idea in more detail (at least 100 characters).');
    setIsLoading(true);
    setLoadingMsg('Checking safety and guidelines...');
    setGeneratedIdeas(null);
    setIsEvaluationVisible(false);
    setChatMessages([]);
    try {
      const res = await api.post('/api/v1/idea/evaluate', {
        idea: ideaInput,
        is_private: isPrivate,
        domain,
        location: targetLocation,
        budget: budgetRange,
      });
      pollStatus(res.data.task_id);
    } catch (err) {
      setIsLoading(false);
      if (err.code === 'ERR_NETWORK' || !err.response) {
        toast.error('Lost connection to server. Please check your network.');
      } else if (err.response?.status === 503 || err.response?.status === 429) {
        toast.error('High traffic — please retry in a moment.');
      } else {
        toast.error(err.response?.data?.detail || 'Could not connect to the server.');
      }
    }
  }, [ideaInput, isPrivate, pollStatus, api, domain, targetLocation, budgetRange]);

  const _doGenerate = useCallback(async () => {
    setIsLoading(true);
    setLoadingMsg('Understanding your request...');
    
    const genProgressTimer = setInterval(() => {
      setLoadingMsg(prev => {
        if (prev.includes("Understanding")) return "Scanning industry opportunities...";
        if (prev.includes("Scanning")) return "Generating concept ideas...";
        if (prev.includes("Generating")) return "Finalizing your suggestions...";
        return prev;
      });
    }, 4000);

    setEvaluation(null);
    setIsEvaluationVisible(false);
    const finalType = genType === 'SaaS' ? `${domain} Industry (SaaS/Software)` : `${domain} Industry (Physical/Local Business)`;
    const existingTitles = generatedIdeas && generatedIdeas.ideas ? generatedIdeas.ideas.map(i => i.title) : [];
    try {
      const res = await api.post('/api/v1/idea/generate', {
        business_type: finalType,
        location: targetLocation || 'Global',
        budget: budgetRange || 'Flexible',
        existing_ideas: existingTitles,
      });
      clearInterval(genProgressTimer);
      setGeneratedIdeas(res.data);
      setIsLoading(false);
      navigate('/generate/results');
    } catch (err) {
      clearInterval(genProgressTimer);
      setIsLoading(false);
      toast.error(err.response?.data?.detail || 'Generation failed. Please check your inputs.');
    }
  }, [domain, targetLocation, budgetRange, genType, generatedIdeas, api, navigate]);

  // Gate: require login before running evaluate/generate
  const handleEvaluate = useCallback(() => {
    if (!isLoggedIn) {
      pendingAction.current = 'analyze';
      setShowLoginModal(true);
      return;
    }
    _doEvaluate();
  }, [isLoggedIn, _doEvaluate]);

  const handleGenerate = useCallback(() => {
    if (!isLoggedIn) {
      pendingAction.current = 'generate';
      setShowLoginModal(true);
      return;
    }
    _doGenerate();
  }, [isLoggedIn, _doGenerate]);

  // Called after successful login — resume pending action
  const handleLoginSuccess = useCallback(() => {
    if (pendingAction.current === 'analyze') _doEvaluate();
    else if (pendingAction.current === 'generate') _doGenerate();
    pendingAction.current = null;
  }, [_doEvaluate, _doGenerate]);

  const handleFetchPivots = useCallback(async () => {
    if (!evaluationId) { toast.error('Please check an idea first.'); return; }
    setPivotsLoading(true);
    setPivots([]);
    navigate('/pivot');
    try {
      const res = await api.post('/api/v1/idea/pivot', {
        evaluation_id: evaluationId,
        location: targetLocation || null,
        business_type: domain || null,
      });
      setPivots(res.data.pivots || []);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not generate pivots.');
    } finally {
      setPivotsLoading(false);
    }
  }, [evaluationId, targetLocation, domain, api, navigate]);

  const handleSendMessage = useCallback(async (msg) => {
    if (!evaluationId) {
      toast.error('Please check your idea again first.');
      return;
    }
    const newMessages = [...chatMessages, { role: 'user', content: msg }];
    setChatMessages(newMessages);
    setIsChatTyping(true);
    try {
      const res = await api.post(`/api/v1/chat/${evaluationId}`, { message: msg });
      setChatMessages([...newMessages, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      toast.error('Advisor disconnected.');
    } finally {
      setIsChatTyping(false);
    }
  }, [evaluationId, chatMessages, api]);

  const fetchHistory = async () => {
    try { const res = await api.get('/api/v1/history/'); setHistoryList(res.data); }
    catch (e) { /* silently fail */ }
  };

  const deleteHistoryItem = async (id) => {
    try { await api.delete(`/api/v1/history/${id}`); setHistoryList(p => p.filter(h => h.id !== id)); }
    catch (e) { /* silently fail */ }
  };

  const deleteMultipleHistoryItems = async (ids) => {
    try {
      await api.post('/api/v1/history/delete-multiple', ids);
      setHistoryList(p => p.filter(h => !ids.includes(h.id)));
    } catch (e) { /* silently fail */ }
  };

  const clearAllHistory = async () => {
    try { await api.delete('/api/v1/history/'); setHistoryList([]); }
    catch (e) { /* silently fail */ }
  };

  const fetchSavedIdeas = async () => {
    try { const res = await api.get('/api/v1/saved-ideas/'); setSavedIdeas(res.data); }
    catch (e) { /* silently fail */ }
  };

  const handleSaveIdea = async (idea) => {
    try {
      await api.post('/api/v1/saved-ideas/', { title: idea.title || idea.idea_description, content: idea });
      fetchSavedIdeas();
    } catch (e) { /* silently fail */ }
  };

  const handleDeleteSavedIdea = async (id) => {
    try { await api.delete(`/api/v1/saved-ideas/${id}`); setSavedIdeas(p => p.filter(i => i.id !== id)); }
    catch (e) { /* silently fail */ }
  };
  const handleUnsaveIdeaByContent = async (title) => {
    const existing = savedIdeas.find(i => (i.title === title || i.content?.idea_description === title));
    if (existing) {
      await handleDeleteSavedIdea(existing.id);
    }
  };

  useEffect(() => {
    if (location.pathname === '/history') fetchHistory();
    if (location.pathname === '/profile') fetchSavedIdeas();
  }, [location.pathname]);

  const primaryFromLanding = () => {
    if (landingMode === 'analyze') { handleEvaluate(); return; }
    if (genStep === 1) { setGenStep(2); return; }
    handleGenerate();
  };

  return (
    <PageShell>
      <Toaster position="top-center" />
      <AppHeader user={user} isLoggedIn={isLoggedIn} onLogin={() => setShowLoginModal(true)} />

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => { setShowLoginModal(false); pendingAction.current = null; }}
        onSuccess={handleLoginSuccess}
      />

      {/* Ethical Refusal Modal */}
      {refusalModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg mx-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <button onClick={() => setRefusalModal({ open: false, reason: '' })}
              className="absolute top-4 right-4 p-2 rounded-xl text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-6">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-black text-[var(--text-main)] mb-3">Idea Could Not Be Evaluated</h3>
              <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed mb-6 max-w-sm">
                {refusalModal.reason || 'Your idea was flagged by our ethical safety system. Please review and refine your concept.'}
              </p>
              <button onClick={() => { setRefusalModal({ open: false, reason: '' }); navigate('/analyze'); }}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-500/20">
                <ArrowRight className="h-4 w-4" /> Refine Your Idea
              </button>
              <button onClick={() => setRefusalModal({ open: false, reason: '' })}
                className="mt-3 w-full h-10 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/analyze" replace />} />
        <Route path="/analyze" element={
          isLoading ? <LoadingPage message={loadingMsg} mode={landingMode} /> : (
            <LandingPage
              ideaInput={ideaInput} setIdeaInput={setIdeaInput}
              mode={landingMode} setMode={setLandingMode}
              isPrivate={isPrivate} setIsPrivate={setIsPrivate}
              domain={domain} setDomain={setDomain}
              location={targetLocation} setLocation={setTargetLocation}
              budget={budgetRange} setBudget={setBudgetRange}
              businessModel={businessModel} setBusinessModel={setBusinessModel}
              onPrimaryAction={primaryFromLanding}
              genStep={genStep} setGenStep={setGenStep}
              genType={genType} setGenType={setGenType}
              evaluation={evaluation}
              onDiscuss={handleSendMessage}
              chatMessages={chatMessages}
              isChatTyping={isChatTyping}
              selectedConcept={selectedConcept}
              onClearPreview={() => setSelectedConcept(null)}
              onSaveIdea={handleSaveIdea}
              onUnsaveIdea={handleUnsaveIdeaByContent}
              savedIdeas={savedIdeas}
            />
          )
        } />
        <Route path="/generate/results" element={
          <GeneratedResultsPage
            founderConstraints={{ domain: domain || 'General', location: targetLocation || 'Global', budget: budgetRange || 'Flexible' }}
            setFounderConstraints={() => { }}
            ideas={generatedIdeas?.ideas || generatedIdeas || []}
            onAnalyzeIdea={handlePreviewIdea}
            onRefineIdeas={() => { setGenStep(1); setLandingMode('generate'); navigate('/analyze'); }}
            onRegenerate={handleGenerate}
            onSaveIdea={handleSaveIdea}
            onUnsaveIdea={handleUnsaveIdeaByContent}
            isPrivate={isPrivate} setIsPrivate={setIsPrivate}
          />
        } />
        <Route path="/evaluation" element={
          <EvaluationPage
            isPrivate={isPrivate} setIsPrivate={setIsPrivate}
            evaluation={evaluation} evaluationId={evaluationId}
            chatMessages={chatMessages} isChatTyping={isChatTyping}
            onDiscuss={handleSendMessage} onPivot={handleFetchPivots}
          />
        } />
        <Route path="/advisor" element={
          <EvaluationPage
            isPrivate={isPrivate} setIsPrivate={setIsPrivate}
            evaluation={evaluation} evaluationId={evaluationId}
            chatMessages={chatMessages} isChatTyping={isChatTyping}
            onDiscuss={handleSendMessage} onPivot={handleFetchPivots}
          />
        } />
        <Route path="/pivot" element={
          <PivotPage
            pivots={pivots} pivotsLoading={pivotsLoading} originalIdea={ideaInput}
            onAnalyze={handlePreviewIdea}
            onSave={handleSaveIdea}
            onUnsave={handleUnsaveIdeaByContent}
            onDiscuss={(pivot) => {
              setChatMessages([{ role: 'assistant', content: `Let's discuss this option:\n\n**${pivot.idea_description}**\n\n${pivot.strategic_advantage}\n\nWhat would you like to explore — how it works, how to start, or costs?` }]);
              navigate('/advisor');
            }}
          />
        } />
        <Route path="/history" element={
          <HistoryPage
            historyList={historyList}
            onOpen={(item) => { setEvaluation(item.analysis_results || item.evaluation || null); setEvaluationId(item.id || item.evaluation_id || null); setChatMessages([]); navigate('/evaluation'); }}
            onDelete={deleteHistoryItem}
            onDeleteMultiple={deleteMultipleHistoryItems}
            onClearAll={clearAllHistory}
          />
        } />
        <Route path="/profile" element={
          <ProfilePage
            user={user} theme={theme} setTheme={setTheme}
            savedIdeas={savedIdeas}
            onDeleteIdea={handleDeleteSavedIdea}
            onAnalyzeIdea={handlePreviewIdea}
          />
        } />
        <Route path="*" element={<Navigate to="/analyze" replace />} />
      </Routes>
      {/* Global Concept Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl border border-[var(--border-color)] overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh]">
            <button
              onClick={() => setPreviewModal({ isOpen: false, concept: null })}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors z-[110]"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar h-full max-h-[90vh]">
              <ConceptPreview
                concept={previewModal.concept}
                onAnalyze={handleFullAnalysis}
                onBack={() => setPreviewModal({ isOpen: false, concept: null })}
                onSave={handleSaveIdea}
                onUnsave={handleUnsaveIdeaByContent}
                isSaved={savedIdeas.some(i => i.title === (previewModal.concept?.title || previewModal.concept?.id) || i.content?.idea_description === (previewModal.concept?.idea_description || previewModal.concept?.description))}
              />
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
