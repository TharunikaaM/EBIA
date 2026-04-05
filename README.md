# 🚀 EBIA – Evidence-Based Improvement Advisor

AI-powered platform for **startup idea validation using fact-grounded RAG pipelines**, ensuring decisions are based on real market evidence rather than LLM hallucinations.

---

## 🎯 Problem

Startup ideas often fail due to **lack of real market validation**.
Most AI tools generate suggestions based on generic knowledge without grounding in actual data.

EBIA addresses this by combining **semantic retrieval and LLM reasoning** to provide **evidence-backed insights**.

---

## ⚙️ Tech Stack

* **Backend:** FastAPI, PostgreSQL
* **Frontend:** React (Vite), Tailwind CSS
* **AI/ML:** LangChain, Sentence Transformers, BERTopic
* **Vector Database:** FAISS
* **LLM:** Groq (LLaMA) / Ollama

---

## 🧠 Architecture

```
User Input → Embedding → FAISS Retrieval → LLM → Structured Output
```

---

## 🔄 Workflow

1. User submits a startup idea with domain and location
2. System converts input into embeddings
3. FAISS retrieves relevant market data (trends, competitors, pain points)
4. BERTopic extracts themes and insights
5. LLM generates feasibility analysis, risks, and refined suggestions
6. Results are presented via dashboard and downloadable reports

---

## 📊 Features

* **Evidence-Based Scoring**
  Calculates feasibility using vector similarity and topic density

* **Fact-Grounded RAG Pipeline**
  Reduces hallucination by grounding responses in retrieved evidence

* **Smart Pivot Suggestions**
  Suggests alternative strategies for high-risk ideas

* **Regional Budget Estimation**
  Generates MVP and scaling cost estimates based on location

* **Ethical Filtering System**
  Detects unsafe or unethical business models and suggests alternatives

---

## 📈 Output

* Feasibility score
* Risk analysis
* Refined startup idea
* Evidence citations
* Downloadable PDF reports

---

## 📸 Screenshots

### 🔹 Dashboard View

<img width="1919" height="867" alt="Screenshot 2026-04-05 212034" src="https://github.com/user-attachments/assets/9c0b2c80-9999-4ce9-ad2d-ce64eda2a4f3" />

### 🔹 Feasibility Analysis

<img width="1918" height="869" alt="Screenshot 2026-04-05 211810" src="https://github.com/user-attachments/assets/33d54b29-f12d-4960-9d08-8433d2d657f2" />

### 🔹 Generated Report

<img width="782" height="629" alt="Screenshot 2026-04-05 211905" src="https://github.com/user-attachments/assets/1a9fa48d-7136-41d2-9ab3-a00741abbaea" />


---

## 🛠️ Setup

### 1. Clone Repository

```
git clone <repository-url>
cd ebia
```

---

### 2. Backend Setup

```
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file:

```
DATABASE_URL=postgresql://user:password@localhost:5432/ebia
OLLAMA_BASE_URL=http://localhost:11434
GROQ_API_KEY=your_key_here
SECRET_KEY=your_secret_key
```

Run backend:

```
python init_db.py
python scripts/ingest_data.py
uvicorn main:app --reload
```

---

### 3. Frontend Setup

```
cd ../frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```
ebia/
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── schemas/
│   └── scripts/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── App.jsx
```

---

## 📌 License

This project is developed as part of a Final Year Project.
