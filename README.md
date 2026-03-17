# EBIA (Evidence-Based Improvement Advisor) 🚀

EBIA is a production-ready, intelligence-driven chatbot system designed to help entrepreneurs evaluate startup ideas, discover market pivots, and estimate budgets using grounded market evidence.

Built with **FastAPI**, **PostgreSQL**, **FAISS**, and **React**, EBIA goes beyond generic AI advice by anchoring every suggestion in retrieved market data and strategic reasoning.

---

## 🌟 Key Features

### 🏦 Grounded Pivot & Budgeting Engine
- **Strategic Alternatives**: Suggests 3 grounded pivots if an idea is high-risk.
- **Regional Budgeting**: Dynamically calculates MVP and Scaling budgets based on user location and business type.
- **Resource Allocation**: Detailed breakdown of spending for Development, Marketing, and Operations.

### 🛡️ Privacy-First Intelligence
- **Privacy Wall**: Users can mark evaluations as `Private` (locked) or `Public` (shareable).
- **Public-Only Discovery**: AI recommendations are generated strictly from public curated data, never from private user submissions.

### 📊 Evidence-Based Scoring
- **Deterministic Logic**: Feasibility scores are calculated using vector distance metrics and topic density, not just LLM "vibes."
- **Source Attribution**: Highlights specific documents and trends (from FAISS) that influenced the evaluation.

### 🎭 Multi-Layered Ethical Filtering
- **Startup Ethics**: Filters for predatory pricing, data theft, or harmful business models.
- **Correction Paths**: Instead of a flat refusal, EBIA provides a "safe" strategic alternative for flagged ideas.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

1.  **Python 3.10+**: Core backend runtime.
2.  **PostgreSQL**: Primary database for history and document storage.
3.  **Ollama** (or Groq API): For running local or cloud-based LLM generation.
4.  **Node.js & npm**: For the React/Vite/Tailwind frontend.

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ebia
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Configuration**: Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ebia
OLLAMA_BASE_URL=http://localhost:11434
GROQ_API_KEY=your_key_here  # Optional
SECRET_KEY=your_secret_key
```

**Initialize DB**:
```bash
python init_db.py
python scripts/ingest_data.py  # Ingests initial market documents
```

**Start Backend**:
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## ⚙️ How it Works

1.  **Submission**: User submits a startup idea and specifies location/business type.
2.  **Retrieval (RAG)**: The system embeds the idea and searches the **FAISS Vector Store** for similar market trends, pain points, and competitors.
3.  **Filtering**: The **Ethical Filter Service** scans the idea for compliance.
4.  **Analysis**: The **Topic Service** (BERTopic) and **Scoring Service** calculate feasibility based on retrieval distance and documented market gaps.
5.  **Generation**: The LLM synthesizes the final report, including cited evidence and pivot suggestions.
6.  **Export**: Results can be exported as professional PDFs for business planning.

---

## 📂 Project Structure

```text
ebia/
├── backend/
│   ├── controllers/   # API logic & Swagger
│   ├── services/      # Business logic (Pivot, Scoring, Retrieval)
│   ├── models/        # SQLAlchemy Database models
│   ├── schemas/       # Pydantic Request/Response models
│   └── scripts/       # Data ingestion & utilities
├── frontend/
│   ├── src/
│   │   ├── components/# Modular UI (FeasibilityMeter, PivotPanel)
│   │   └── App.jsx    # Main dashboard logic
```

---

## 📝 License
This project is developed as part of a Final Year Project. All rights reserved.
