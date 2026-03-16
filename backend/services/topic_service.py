"""
Service for topic modeling simulation.
"""
from bertopic import BERTopic
import logging

logger = logging.getLogger(__name__)

# Note: For a real high-throughput application, BERTopic/LDA would be trained 
# on a large corpus and the model kept in memory.
# In this implementation, we will perform short-text topic modeling over a combination
# of the input idea and related context, or fall back to LLM/keywords if data is too small.

def extract_topics(text: str, context_docs: list = None) -> list:
    """
    Extracts topics using BERTopic if sufficient context is available, 
    otherwise falls back to a lightweight keyword/LLM extraction approach.
    """
    topics = []
    
    # Simple keyword-based extraction as a baseline
    text_lower = text.lower()
    if "data" in text_lower or "ai" in text_lower or "machine learning" in text_lower:
        topics.append("Artificial Intelligence")
    if "health" in text_lower or "medical" in text_lower:
        topics.append("Healthcare")
    if "finance" in text_lower or "money" in text_lower or "invest" in text_lower:
        topics.append("FinTech")
    if "farm" in text_lower or "agriculture" in text_lower:
         topics.append("AgriTech")
    if "education" in text_lower or "learn" in text_lower or "student" in text_lower:
        topics.append("EdTech")
        
    doc_list = [text]
    if context_docs:
        doc_list.extend([doc.get("content", "") for doc in context_docs if isinstance(doc, dict) and "content" in doc])
        
    # BERTopic requires a sufficient number of documents to form clusters. 
    # For a single idea + ~3 context docs, BERTopic might struggle to form meaningful clusters 
    # without a pre-trained base model.
    # Overriding the minimum topic size to attempt extraction.
    if len(doc_list) >= 3:
        try:
             # Very conservative settings for small text clumps
            topic_model = BERTopic(min_topic_size=2) 
            topics_found, probs = topic_model.fit_transform(doc_list)
            
            # Extract top words for the found topics
            topic_info = topic_model.get_topic_info()
            for index, row in topic_info.iterrows():
                if row['Topic'] != -1: # Ignore outlier topic
                     topic_words = topic_model.get_topic(row['Topic'])
                     if topic_words:
                         # Just take the top word of the topic as a representative label
                         best_word = topic_words[0][0]
                         topics.append(best_word.capitalize())
        except Exception as e:
            logger.warning(f"BERTopic extraction failed or skipped due to small corpus: {e}")
            
    # Deduplicate and ensure we have at least 'Innovation'
    final_topics = list(set([t for t in topics if t]))
    if not final_topics:
        final_topics = ["Innovation", "Technology"]
        
    return final_topics
