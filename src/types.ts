export interface SummaryResult {
  summary: string;
  sentences: ScoredSentence[];
  stats: {
    originalWords: number;
    summaryWords: number;
    compressionPct: number;
    sentenceCount: number;
    selectedCount: number;
  };
}

export interface ScoredSentence {
  text: string;
  score: number;
  position: number;
  selected: boolean;
}

export interface SummarizeOptions {
  /** Max sentences in summary. Default: 3 */
  maxSentences?: number;
  /** Max words in summary. Default: 150 */
  maxWords?: number;
  /** Output format. Default: 'text' */
  format?: 'text' | 'bullets' | 'json';
}
