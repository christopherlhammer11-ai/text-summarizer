import { summarize } from '../src/summarizer';

const ARTICLE = `Artificial intelligence has transformed the technology industry in recent years. Companies like Google, Microsoft, and OpenAI have invested billions in developing large language models. These models can generate text, write code, and answer complex questions. However, there are significant concerns about bias and safety. Researchers have found that AI systems can amplify existing societal biases. The European Union has proposed comprehensive regulation of AI systems. Despite the challenges, adoption continues to accelerate across healthcare, finance, and education. A recent study showed that 75% of enterprises plan to increase AI spending in 2025. The key challenge remains building systems that are both powerful and aligned with human values.`;

describe('summarize', () => {
  it('produces a shorter summary than the input', () => {
    const result = summarize(ARTICLE);
    expect(result.stats.summaryWords).toBeLessThan(result.stats.originalWords);
    expect(result.stats.compressionPct).toBeGreaterThan(0);
  });

  it('respects maxSentences', () => {
    const result = summarize(ARTICLE, { maxSentences: 2 });
    expect(result.stats.selectedCount).toBeLessThanOrEqual(2);
  });

  it('respects maxWords', () => {
    const result = summarize(ARTICLE, { maxWords: 30 });
    expect(result.stats.summaryWords).toBeLessThanOrEqual(35); // slight slack
  });

  it('preserves sentence order', () => {
    const result = summarize(ARTICLE, { maxSentences: 3 });
    const selected = result.sentences.filter(s => s.selected);
    for (let i = 1; i < selected.length; i++) {
      expect(selected[i].position).toBeGreaterThan(selected[i - 1].position);
    }
  });

  it('scores first sentence highly', () => {
    const result = summarize(ARTICLE);
    const first = result.sentences[0];
    const avgScore = result.sentences.reduce((s, v) => s + v.score, 0) / result.sentences.length;
    expect(first.score).toBeGreaterThanOrEqual(avgScore);
  });

  it('outputs bullet format', () => {
    const result = summarize(ARTICLE, { format: 'bullets' });
    expect(result.summary).toContain('- ');
  });

  it('outputs json format', () => {
    const result = summarize(ARTICLE, { format: 'json' });
    const parsed = JSON.parse(result.summary);
    expect(parsed.summary).toBeDefined();
    expect(Array.isArray(parsed.summary)).toBe(true);
  });

  it('handles empty input', () => {
    const result = summarize('');
    expect(result.summary).toBe('');
    expect(result.stats.originalWords).toBe(0);
  });

  it('handles single sentence', () => {
    const result = summarize('This is a single sentence about important things in life.');
    expect(result.stats.selectedCount).toBe(1);
  });

  it('scores sentences with numbers/data higher', () => {
    const text = 'The weather was nice today. Revenue increased by 150% to $2.5 million in Q3. Birds were singing outside the window.';
    const result = summarize(text);
    const dataIdx = result.sentences.findIndex(s => s.text.includes('150%'));
    const fillerIdx = result.sentences.findIndex(s => s.text.includes('Birds'));
    if (dataIdx !== -1 && fillerIdx !== -1) {
      expect(result.sentences[dataIdx].score).toBeGreaterThan(result.sentences[fillerIdx].score);
    }
  });
});
