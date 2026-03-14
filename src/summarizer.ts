import { SummaryResult, ScoredSentence, SummarizeOptions } from './types';

const DEFAULTS: Required<SummarizeOptions> = {
  maxSentences: 3,
  maxWords: 150,
  format: 'text',
};

/**
 * Extractive summarization — scores each sentence and selects the best ones.
 * No LLM calls. Uses TF-IDF-inspired word frequency + position + length heuristics.
 */
export function summarize(text: string, options?: SummarizeOptions): SummaryResult {
  const opts = { ...DEFAULTS, ...options };
  const sentences = splitSentences(text);
  const originalWords = text.split(/\s+/).filter(Boolean).length;

  if (sentences.length === 0) {
    return {
      summary: '',
      sentences: [],
      stats: { originalWords: 0, summaryWords: 0, compressionPct: 0, sentenceCount: 0, selectedCount: 0 },
    };
  }

  // Build word frequency map (TF component)
  const wordFreq = buildWordFrequency(text);

  // Score each sentence
  const scored: ScoredSentence[] = sentences.map((sent, idx) => ({
    text: sent,
    score: scoreSentence(sent, idx, sentences.length, wordFreq),
    position: idx,
    selected: false,
  }));

  // Select top sentences by score, respecting limits
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  let wordCount = 0;
  let selectedCount = 0;

  for (const s of sorted) {
    const words = s.text.split(/\s+/).length;
    if (selectedCount >= opts.maxSentences) break;
    if (wordCount + words > opts.maxWords && selectedCount > 0) break;
    scored[s.position].selected = true;
    wordCount += words;
    selectedCount++;
  }

  // Build summary in original order
  const selectedSentences = scored.filter(s => s.selected).map(s => s.text);
  let summary: string;

  switch (opts.format) {
    case 'bullets':
      summary = selectedSentences.map(s => `- ${s}`).join('\n');
      break;
    case 'json':
      summary = JSON.stringify({ summary: selectedSentences }, null, 2);
      break;
    default:
      summary = selectedSentences.join(' ');
  }

  const summaryWords = summary.split(/\s+/).filter(Boolean).length;

  return {
    summary,
    sentences: scored,
    stats: {
      originalWords,
      summaryWords,
      compressionPct: originalWords > 0
        ? Math.round((1 - summaryWords / originalWords) * 100)
        : 0,
      sentenceCount: sentences.length,
      selectedCount,
    },
  };
}

function splitSentences(text: string): string[] {
  // Split on sentence boundaries, handle abbreviations
  return text
    .replace(/([.!?])\s+/g, '$1\n')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 10); // skip very short fragments
}

function buildWordFrequency(text: string): Map<string, number> {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const freq = new Map<string, number>();

  // Common stop words to skip
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'out', 'off', 'up',
    'down', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both',
    'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than',
    'too', 'very', 'just', 'because', 'if', 'when', 'where', 'how', 'what',
    'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'it', 'its',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his',
    'she', 'her', 'they', 'them', 'their', 'about',
  ]);

  for (const word of words) {
    if (!stopWords.has(word) && word.length > 2) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
  }

  return freq;
}

function scoreSentence(
  sentence: string,
  position: number,
  totalSentences: number,
  wordFreq: Map<string, number>,
): number {
  const words = sentence.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;

  // 1. Word frequency score (TF-inspired)
  let freqScore = 0;
  for (const word of words) {
    freqScore += wordFreq.get(word) || 0;
  }
  freqScore /= words.length; // normalize by length

  // 2. Position score — first and last sentences get a boost
  let positionScore = 0;
  if (position === 0) positionScore = 1.0;              // first sentence
  else if (position === totalSentences - 1) positionScore = 0.5; // last sentence
  else if (position < totalSentences * 0.3) positionScore = 0.7; // early sentences
  else positionScore = 0.3;

  // 3. Length score — prefer medium-length sentences
  let lengthScore = 0;
  if (words.length >= 8 && words.length <= 30) lengthScore = 1.0;
  else if (words.length > 30) lengthScore = 0.6;
  else lengthScore = 0.4;

  // 4. Signal words
  let signalScore = 0;
  const signals = /\b(important|significant|key|critical|essential|result|conclusion|found|showed|demonstrated|because|therefore|however|moreover|furthermore)\b/i;
  if (signals.test(sentence)) signalScore = 0.3;

  // 5. Numbers and data — sentences with data tend to be informative
  if (/\d+/.test(sentence)) signalScore += 0.3;
  // Percentage/currency = especially informative
  if (/\d+%|\$\d/.test(sentence)) signalScore += 0.2;

  // Weighted combination
  return freqScore * 0.4 + positionScore * 0.25 + lengthScore * 0.15 + signalScore * 0.2;
}
