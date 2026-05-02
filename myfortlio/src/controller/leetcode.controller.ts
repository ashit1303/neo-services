import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// import { ERR_MSGS } from '../constants/error-messages';
// import { AnalyticsFilterValidation, VINValidation } from '../validation/leetcode-validation';
import { LeetCodeService } from '../services/leetcode.service';
import { ICodeLang } from '../interface/leetcode.interface';
import { config } from '../../config';
import { formatErrorMessage } from '../core/core-utils';

class LeetcodeController {
  leetCodeService: LeetCodeService;

  constructor() {
    this.leetCodeService = new LeetCodeService(config);
  }

  async explainLeetQuest(req: Request, res: Response) {
    try {
      const { url, codelang } = req.query as { url: string; codelang: ICodeLang };
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

      res.status(StatusCodes.OK).send(explain);
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(
          formatErrorMessage(
            error,
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message || 'FAILED_TO_EXPLAIN_QUESTION',
          ),
        );
    }
  }

  async searchLeetCodeQuests(req: Request, res: Response) {
    try {
      const { searchKey } = req.query as { searchKey: string };

      await this.search.ping();

      await this.search.suggest('leetcode', searchKey);
      const result = await this.search.search('leetcode', searchKey);

      const resStmts = await this.leetCodeService.getQuestByIds(result);

      res.status(StatusCodes.OK).send(resStmts);
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(
          formatErrorMessage(
            error,
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message || 'FAILED_TO_SEARCH_QUESTS',
          ),
        );
    }
  }

  async searchLeetCodeQuestsTypesense(req: Request, res: Response) {
    try {
      const { searchKey } = req.query as { searchKey: string };

      await this.search.ping();

      const result = await this.typesense.search(Constants.LeetCollection, {
        q: searchKey,
        query_by: 'questionTitle',
      });

      const resp = result.hits.map(
        (hit: Typesense.SearchClient['apiCall']['hits'][0]) => hit.document,
      );

      res.status(StatusCodes.OK).send(resp);
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(
          formatErrorMessage(
            error,
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message || 'FAILED_TO_SEARCH_TYPE_SENSE',
          ),
        );
    }
  }
}

export default LeetcodeController;
