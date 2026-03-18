"""
Service for advanced topic modeling and pattern mining.
"""
from typing import List, Dict, Any
from bertopic import BERTopic
from bertopic.vectorizers import ClassTfidfTransformer
import logging
import json
from services.llm_service import LLMService
from config.prompts import PromptConfig

logger = logging.getLogger(__name__)

# Fallback categories if modeling fails
DEFAULT_TOPICS = {
    "pain_points": ["High operational costs", "Market reaching saturation"],
    "trends": ["Shift towards automation", "Growing digital ecosystems"],
    "features": ["AI-driven insights", "Seamless mobile integration"]
}

def synthesize_topic_cluster_summary(docs: List[str], cluster_keywords: List[str]) -> str:
    """
    Synthesizes a human-readable market reality from a cluster of documents using LLM.
    """
    context_blob = "\n---\n".join(docs[:5])
    analysis_prompt = PromptConfig.get_topic_cluster_synthesis_prompt(cluster_keywords, context_blob)
    try:
        summary_text = LLMService.generate(analysis_prompt)
        return summary_text.strip()
    except Exception as e:
        logger.error(f"Cluster synthesis failure: {e}")
        return cluster_keywords[0].capitalize() if cluster_keywords else "Unknown Trend"

def mine_market_patterns_and_topics(seed_text: str, contextual_documents: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Orchestrates the extraction of market patterns (Pain Points, Trends, Features) 
    using BERTopic enhanced by c-TF-IDF and LLM-driven synthesis.
    """
    extracted_insights = {
        "user_pain_points": [],
        "market_trends": [],
        "key_features": []
    }
    
    # Consolidate corpus for modeling
    modeling_corpus = [seed_text]
    if contextual_documents:
        modeling_corpus.extend([
            doc.get("content", "") 
            for doc in contextual_documents 
            if isinstance(doc, dict) and "content" in doc
        ])
    
    # Heuristic: Direct LLM extraction for small datasets
    if len(modeling_corpus) < 3:
        logger.info("Insufficient corpus size for BERTopic. Delegating to direct LLM pattern mining.")
        return execute_llm_pattern_mining_fallback(seed_text)

    try:
        # Enforce Class-based TF-IDF for high-impact keyword differentiation
        tfidf_transformer = ClassTfidfTransformer(reduce_frequent_words=True)
        bertopic_engine = BERTopic(
            ctfidf_model=tfidf_transformer,
            min_topic_size=2,
            embedding_model="all-MiniLM-L6-v2"
        )
        
        topic_assignments, _ = bertopic_engine.fit_transform(modeling_corpus)
        topic_metadata = bertopic_engine.get_topic_info()
        
        for _, row in topic_metadata.iterrows():
            topic_idx = row['Topic']
            if topic_idx == -1: continue # Noise suppression
            
            cluster_docs = [modeling_corpus[i] for i, t in enumerate(topic_assignments) if t == topic_idx]
            cluster_keywords = [word for word, _ in bertopic_engine.get_topic(topic_idx)][:5]
            
            market_summary = synthesize_topic_cluster_summary(cluster_docs, cluster_keywords)
            category_tag = classify_market_insight_category(market_summary)
            
            if category_tag in extracted_insights:
                extracted_insights[category_tag].append(market_summary)

    except Exception as e:
        logger.error(f"BERTopic pattern mining pipeline failed: {e}")
        return execute_llm_pattern_mining_fallback(seed_text)

    # Apply default indicators if zero results found
    for key in extracted_insights:
        if not extracted_insights[key]:
            extracted_insights[key] = DEFAULT_TOPICS.get(key, [])
            
    return extracted_insights

def classify_market_insight_category(insight_text: str) -> str:
    """
    Categorizes a market reality summary based on linguistic indicators.
    """
    text_normalized = insight_text.lower()
    
    problem_signals = ["frustrated", "slow", "expensive", "hard", "problem", "lack", "struggle", "too", "difficult"]
    if any(s in text_normalized for s in problem_signals):
        return "user_pain_points"
    
    growth_signals = ["growing", "shift", "emerging", "trend", "adoption", "future", "market", "rising", "surge"]
    if any(s in text_normalized for s in growth_signals):
        return "market_trends"
        
    return "key_features"

def execute_llm_pattern_mining_fallback(idea_text: str) -> Dict[str, Any]:
    """
    Direct LLM-based pattern extraction for limited target data.
    """
    mining_prompt = PromptConfig.get_llm_pattern_mining_prompt(idea_text)
    try:
        raw_json_response = LLMService.generate(mining_prompt, json_format=True)
        data = json.loads(raw_json_response.replace('```json', '').replace('```', '').strip())
        return {
            "user_pain_points": data.get("user_pain_points", DEFAULT_TOPICS["pain_points"]),
            "market_trends": data.get("market_trends", DEFAULT_TOPICS["market_trends"]),
            "key_features": data.get("key_features", DEFAULT_TOPICS["features"])
        }
    except Exception:
        return DEFAULT_TOPICS
