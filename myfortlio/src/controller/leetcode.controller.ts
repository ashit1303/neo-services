import { Request, Response } from 'express';
import { LeetCodeService } from '../services/leetcode.service';
import { ICodeLang } from '../interface/leetcode.interface';
import { config } from '../../config';
import { fmtErr, fmtPrntErr } from '../core/core-utils/err-util';
import { fmtRes } from '../core/core-utils/res-util';

class LeetcodeController {
  leetCodeService: LeetCodeService;

  constructor() {
    this.leetCodeService = new LeetCodeService(config);
  }

  async explainLeetQuest(req: Request, res: Response) {
    const { url, codelang } = req.query as { url: string; codelang: ICodeLang };

    try {
      const slug = this.leetCodeService.getSlugFromUrl(url);
      let dbQuestion = await this.leetCodeService.getQuestFromDB(slug);

      if (!dbQuestion || !dbQuestion.questionId) {
        dbQuestion = await this.leetCodeService.fetchQuestionDetailsFromLeetCode(slug);
      }
      const solution = await this.leetCodeService.getQuestAnsFromDB(slug, codelang);
      let explain = solution?.llmRes;
      if (!solution || !solution.llmRes) {
        const question = `Problem Title: ${dbQuestion.questionTitle}\n Problem Statement:\n${dbQuestion.content}`;
        explain = await this.leetCodeService.getExplanation(codelang, question, dbQuestion.questionId);
      }
      return fmtRes(res, explain);
    } catch (error: any) {
      throw fmtErr(error, { msg: 'Failed to explain question', apiName: 'explainLeetQuest', debugValues: { url, codelang } });
    }
  }

  async searchLeetCodeQuests(req: Request, res: Response) {
    const { searchKey } = req.query as { searchKey: string };

    try {
      await this.search.ping();
      await this.search.suggest('leetcode', searchKey);
      const result = await this.search.search('leetcode', searchKey);
      const resStmts = await this.leetCodeService.getQuestByIds(result);
      return fmtRes(res, resStmts);
    } catch (error: any) {
      throw fmtPrntErr(error, 400, { msg: 'Failed to search question', apiName: 'searchLeetCodeQuests', debugValues: { searchKey } });
    }
  }

  async searchLeetCodeQuestsTypesense(req: Request, res: Response) {
    const { searchKey } = req.query as { searchKey: string };

    try {
      await this.search.ping();
      const result = await this.typesense.search(Constants.LeetCollection, { q: searchKey, query_by: 'questionTitle' });
      const resp = result.hits.map((hit: Typesense.SearchClient['apiCall']['hits'][0]) => hit.document);
      return fmtRes(res, resp);
    } catch (error: any) {
      throw fmtPrntErr(error, 400, { msg: 'Failed to search question', apiName: 'searchLeetCodeQuestsTypesense', debugValues: { searchKey } });

    }
  }
}

export default LeetcodeController;
