export { summarize } from './summarizer';
export type { SummaryResult, ScoredSentence, SummarizeOptions } from './types';

import { summarize } from './summarizer';
import { SummarizeOptions } from './types';
import * as fs from 'fs';

export async function summarizeFile(filePath: string, options?: SummarizeOptions) {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return summarize(content, options);
}
