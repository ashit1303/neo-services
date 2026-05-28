import { Request, Response } from 'express';
import type { LeetcodeService } from '../services/leetcode.service';
import { ICodeLang } from '../interface/leetcode.interface';
import { AppError } from '../core/core-utils/err-util';
import { fmtRes } from '../core/core-utils/res-util';
import { sensiSearch } from '../clients';
import { TYPSENSE_COLLECTION_NAME } from '../core/core-constants/common.constants';

class LeetcodeController {

  constructor(private leetcodeService: LeetcodeService) { }

  explainLeetQuest = async (req: Request, res: Response) => {
    const { url, codelang } = req.query as { url: string; codelang: ICodeLang };

    try {
      const slug = this.leetcodeService.getSlugFromUrl(url);
      let dbQuestion = await this.leetcodeService.getQuestFromDB(slug);

      if (!dbQuestion || !dbQuestion.questionId) {
        dbQuestion = await this.leetcodeService.fetchQuestionDetailsFromLeetCode(slug);
      }
      const solution = await this.leetcodeService.getQuestAnsFromDB(slug, codelang);
      let explain = solution?.llmRes;
      if (!solution || !solution.llmRes) {
        const question = `Problem Title: ${dbQuestion.questionTitle}\n Problem Statement:\n${dbQuestion.content}`;
        explain = await this.leetcodeService.getExplanation(codelang, question, dbQuestion.questionId);
      }
      return fmtRes(res, explain);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: 'Failed to explain question', apiName: 'explainLeetQuest', debugValues: { url, codelang } }, 400);
    }
  };

  searchLeetCodeQuests = async (req: Request, res: Response) => {
    const { searchKey } = req.query as { searchKey: string };
    try {
      const result = await sensiSearch.search(TYPSENSE_COLLECTION_NAME.DSA_QUESTIONS, { q: searchKey, query_by: 'questionTitle,titleSlug', text_match_type: 'max_score', weights: '2,1' });
      const resp = result?.hits?.map((hit) => hit.document) || [];
      return fmtRes(res, resp);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: 'Failed to search question', apiName: 'searchLeetCodeQuestsTypesense', debugValues: { searchKey } }, 400);

    }
  };
}

export default LeetcodeController;
