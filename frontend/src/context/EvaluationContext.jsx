import { createContext, useContext, useReducer } from 'react';

const initialState = {
  evaluation: null,
  evaluationId: null,
  generatedIdeas: null,
  chatMessages: [],
  isChatTyping: false,
  isLoading: false,
  loadingMsg: 'Checking your idea...',
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_EVALUATION':
      return { ...state, evaluation: action.payload };
    case 'SET_EVALUATION_ID':
      return { ...state, evaluationId: action.payload };
    case 'SET_GENERATED_IDEAS':
      return { ...state, generatedIdeas: action.payload };
    case 'SET_CHAT_MESSAGES':
      return { ...state, chatMessages: action.payload };
    case 'SET_IS_CHAT_TYPING':
      return { ...state, isChatTyping: action.payload };
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LOADING_MSG':
      return { ...state, loadingMsg: action.payload };
    case 'RESET_EVALUATION':
      return { ...state, evaluation: null, evaluationId: null, chatMessages: [] };
    default:
      return state;
  }
};

const EvaluationContext = createContext();

export const EvaluationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <EvaluationContext.Provider value={{ state, dispatch }}>
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluation = () => {
  return useContext(EvaluationContext);
};
