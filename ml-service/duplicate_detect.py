"""
Duplicate topic detection using TF-IDF + Cosine Similarity (NLP)
"""
import sys
import json

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

def check_duplicate(data):
    new_title = (data.get('newTitle') or '').strip()
    new_abstract = (data.get('newAbstract') or new_title).strip()
    existing = data.get('existing') or []

    if not new_title:
        return {'similar': False, 'matches': [], 'message': 'Title required'}

    if not existing:
        return {'similar': False, 'matches': [], 'message': 'No existing projects to compare'}

    if not HAS_SKLEARN:
        # Fallback: simple substring check
        new_lower = (new_title + ' ' + new_abstract).lower()
        matches = []
        for p in existing:
            t = (p.get('title') or '') + ' ' + (p.get('abstract') or '')
            if t.lower() in new_lower or new_lower in t.lower():
                matches.append({'title': p.get('title'), 'score': 0.85})
        return {
            'similar': len(matches) > 0,
            'matches': matches[:5],
            'message': f'Your topic is {int(85 * len(matches))}% similar to existing.' if matches else 'No similar topics found.'
        }

    texts = [new_title + ' ' + new_abstract]
    for p in existing:
        texts.append((p.get('title') or '') + ' ' + (p.get('abstract') or p.get('title') or ''))

    vectorizer = TfidfVectorizer(stop_words='english', max_features=500)
    tfidf = vectorizer.fit_transform(texts)
    sims = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten()

    matches = []
    for i, s in enumerate(sims):
        if i < len(existing) and s >= 0.3:
            matches.append({
                'title': existing[i].get('title'),
                'score': round(float(s), 2)
            })
    matches.sort(key=lambda x: x['score'], reverse=True)
    top = matches[:5]
    max_score = top[0]['score'] if top else 0
    similar = max_score >= 0.5

    message = f"Your topic is {int(max_score * 100)}% similar to '{top[0]['title']}'." if similar and top else 'No similar topics found.'

    return {
        'similar': similar,
        'matches': top,
        'message': message,
        'maxScore': max_score
    }
