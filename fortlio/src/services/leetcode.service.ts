
import DsaQuestions from '../models/dsa-quests.model';
import DsaAnswer from '../models/dsa-answers.model';
import { ICodeLang } from '../interface/leetcode.interface';
import { SecretManager } from '../core/core-clients/secret-manager.client';
import { OllamaClient } from '../core/core-clients/ollama.client';
import { cleanHTML } from '../core/core-utils';
import { Config } from '../interface/common.interface';
import { AppError } from '../core/core-utils/err-util';
import { LEETCODE_MSGS } from '../constants';
import { post } from '../core/core-utils/fetch.util';

export class LeetCodeService {

  private ollama: OllamaClient;
  private secretManager: SecretManager;

  constructor(config: Config) {
    this.ollama = new OllamaClient(config);
    this.secretManager = new SecretManager(config);
  }
  getSlugFromUrl(url: string): string {
    return url.split('problems/')[1].split('/')[0];
  }

  async handleExtraSlugs(slugsList: string[]): Promise<boolean> {
    if (!slugsList || slugsList.length === 0) {
      console.info('No extra slugs to store');
      return true; // Handle empty input gracefully
    }
    try {
      const relatedQuests: any[] = [];
      slugsList.forEach((element: any) => {
        relatedQuests.push(element.titleSlug);
      });
      for await (const slug of relatedQuests) {
        await DsaQuestions.create({ titleSlug: slug });
        //query(`INSERT IGNORE INTO quests (title_slug) VALUES ('${slug}');`);
      }
      return true;
    } catch (error: any) {
      console
        .error(error, { msg: LEETCODE_MSGS.ERR.FAILED_TO_STORE_EXTRA_SLUGS, apiName: 'handleExtraSlugs' });
      return false;
    }
  }

  async storeQuestsAnswer(data: any, codelang: ICodeLang, questionId: string) {
    try {
      // const dbQuestion = await this.getQuestFromDB(slug);
      const dsaAnswer = await DsaAnswer.create({
        questionId: questionId || null,
        codeLang: codelang.toLowerCase(),
        llmRes: data || null,
      });
      return dsaAnswer;;
    } catch (error: any) {
      console
        .error(error, { msg: LEETCODE_MSGS.ERR.FAILED_TO_STORE_QUEST_ANSWER, apiName: 'storeQuestsAnswer' });
      return false;
    }
  }

  async storeQuestion(data: any): Promise<boolean> {
    try {
      this.handleExtraSlugs([...data.similarQuestionList, ...data.nextChallenges]);

      const cleanedContent = cleanHTML(data.content);
      await DsaQuestions.updateOne(
        { titleSlug: data.titleSlug }, // match condition (unique key)
        {
          $set: {
            questionId: data.questionId || null,
            difficulty: data.difficulty ? data.difficulty.toLowerCase() : null,
            questionTitle: data.questionTitle || null,
            content: data.content || null,
            cleanedContent: cleanedContent || null,
            categoryTitle: data.categoryTitle || null,
          },
        },
        {
          upsert: true,
        },
      );
      return true;
    } catch (error: any) {
      console
        .error(error, { msg: LEETCODE_MSGS.ERR.FAILED_TO_STORE_QUEST, apiName: 'storeQuestion' });
      return false;
    }
  }

  async getQuestFromDB(slug: string): Promise<any> {
    try {
      return DsaQuestions.findOne({ titleSlug: slug }).lean();
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: LEETCODE_MSGS.ERR.FAILED_TO_FETCH_QUEST_FROM_DB, apiName: 'getQuestFromDB' });
    }

  }
  async getQuestAnsFromDB(slug: string, codeLang: ICodeLang): Promise<any> {
    try {
      const [quesiton] = await DsaQuestions.aggregate([
        { $match: { titleSlug: slug } },
        {
          $lookup: {
            from: 'questsanswers',
            let: { qId: '$questionId' },
            pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$questionId', '$$qId'] }, { $eq: ['$codeLang', codeLang] }] } } }],
            as: 'answers',
          },
        },
        { $unwind: { path: '$answers', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            questionId: '$questionId',
            titleSlug: '$titleSlug',
            content: '$content',
            codeLang: '$answers.codeLang',
            llmRes: '$answers.llmRes',
            difficulty: '$difficulty',
            questionTitle: '$questionTitle',
          },
        },
        { $limit: 1 },
      ]);
      return quesiton;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: LEETCODE_MSGS.ERR.FAILED_TO_FETCH_QUEST_ANS_FROM_DB, apiName: 'getQuestAnsFromDB' });
    }
  }
  // https://leetcode.com/problems/longest-substring-without-repeating-characters/

  async fetchQuestionDetailsFromLeetCode(slug: string) {
    const url = 'https://leetcode.com/graphql';
    const query = {
      query: ` query getQuestionDetail($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                    titleSlug
                    questionId
                    questionFrontendId
                    questionTitle
                    content
                    categoryTitle
                    difficulty
                    similarQuestionList {
                      difficulty
                      titleSlug
                      questionId
                      title
                    }
                    nextChallenges {
                      difficulty
                      questionId
                      title
                      titleSlug
                    }
                }
            }`,
      variables: { titleSlug: slug },
      // operationName: 'questionDetail'
    };
    try {
      const response = await post(url, query, {
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'cookie': (await this.secretManager.get('LEETCODE_CONFIG').then((res) => JSON.parse(res))).LEET_COOKIE,
          'origin': 'https://leetcode.com',
          'priority': 'u=1, i',
          'random-uuid': '00b3b94a-d622-baec-d6fa-77dbd29d94d3',
          'referer': 'https://leetcode.com/problems/${slug}/description/',
          'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Linux"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'sentry-trace': 'aadd23de586549d0b62e02c85c318cd5-b5d86e9245155ec0-0',
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
          'x-csrftoken': 'Yuj3H94eV7MNl7hAI1OeXAisL1CSkyvmuNauiTyJwJXQNGcvistoup1NwaNZxGZv',
        },
      });

      const problemDetails = response.data.question;
      console.info('problemDetails', JSON.stringify(problemDetails));
      await this.storeQuestion(problemDetails);
      return problemDetails;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: LEETCODE_MSGS.ERR.FAILED_TO_FETCH_QUEST_FROM_LEETCODE, apiName: 'fetchQuestionDetailsFromLeetCode' });
    }
  }

  async getExplanation(codeLang: ICodeLang, questionDescription: string, questionId: string) {
    try {
      const explainPromt = `Give only optimed code, explanation, time and space complexity in ${codeLang}`;
      const llmRes = await this.ollama.generateResponse(explainPromt + ' ' + questionDescription);
      this.storeQuestsAnswer(llmRes, codeLang, questionId);
      return llmRes;
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: LEETCODE_MSGS.ERR.FAILED_TO_GET_EXPLANATION, apiName: 'getExplanation' });
    }
  }

  async sloveSlugInGivenLang(slug: string, codeLang: ICodeLang) {
    try {
      let dbQuestion = await this.fetchQuestionDetailsFromLeetCode(slug);
      const questionId = dbQuestion.questionId;

      dbQuestion = `Problem Title: ${dbQuestion.questionTitle}\n Problem Statement:\n${dbQuestion.cleanedContent || dbQuestion.content}`;
      dbQuestion = JSON.stringify(dbQuestion);
      return this.getExplanation(codeLang, dbQuestion, questionId);
    } catch (error: any) {
      console
        .error(error, { msg: LEETCODE_MSGS.ERR.FAILED_TO_SOLVE_QUEST_IN_GIVEN_LANG, apiName: 'sloveSlugInGivenLang' });
      return false;
    }
  }

  async getUnsolvedQuests() {
    try {
      return DsaQuestions.findOne({ questionId: null });
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: LEETCODE_MSGS.ERR.FAILED_TO_FETCH_UNSOLVED_QUESTS, apiName: 'getUnsolvedQuests' });
    }
  }

  async getQuestByIds(ids: string[]) {
    try {
      return DsaQuestions.aggregate([{ $match: { questionId: { $in: ids } } }]);
    } catch (error: any) {
      throw new AppError(error.message || 'unknown', { msg: LEETCODE_MSGS.ERR.FAILED_TO_FETCH_QUEST_BY_IDS, apiName: 'getQuestByIds' });
    }
  }

  async fetchQuestionLists(skip: string) {
    const url = 'https://leetcode.com/graphql';
    const body = {
      'query': ' query problemsetPanelQuestionList($filters: QuestionFilterInput, $searchKeyword: String, $sortBy: QuestionSortByInput, $categorySlug: String, $limit: Int, $skip: Int) { problemsetPanelQuestionList( filters: $filters searchKeyword: $searchKeyword sortBy: $sortBy categorySlug: $categorySlug limit: $limit skip: $skip ) { questions { id titleSlug title translatedTitle questionFrontendId paidOnly difficulty topicTags { name slug nameTranslated } status isInMyFavorites frequency acRate } totalLength finishedLength panelName hasMore }} ', 'variables': { 'skip': skip, 'limit': 100, 'categorySlug': '', 'filters': { 'filterCombineType': 'ALL', 'statusFilter': { 'questionStatuses': [], 'operator': 'IS' }, 'difficultyFilter': { 'difficulties': [], 'operator': 'IS' }, 'languageFilter': { 'languageSlugs': [], 'operator': 'IS' }, 'topicFilter': { 'topicSlugs': [], 'operator': 'IS' }, 'acceptanceFilter': {}, 'frequencyFilter': {}, 'lastSubmittedFilter': {}, 'publishedFilter': {}, 'companyFilter': { 'companySlugs': [], 'operator': 'IS' }, 'positionFilter': { 'positionSlugs': [], 'operator': 'IS' }, 'premiumFilter': { 'premiumStatus': [], 'operator': 'IS' } }, 'searchKeyword': '', 'sortBy': { 'sortField': 'CUSTOM', 'sortOrder': 'ASCENDING' }, 'options': { 'enabled': true }, 'filtersV2': { 'filterCombineType': 'ALL', 'statusFilter': { 'questionStatuses': [], 'operator': 'IS' }, 'difficultyFilter': { 'difficulties': [], 'operator': 'IS' }, 'languageFilter': { 'languageSlugs': [], 'operator': 'IS' }, 'topicFilter': { 'topicSlugs': [], 'operator': 'IS' }, 'acceptanceFilter': {}, 'frequencyFilter': {}, 'lastSubmittedFilter': {}, 'publishedFilter': {}, 'companyFilter': { 'companySlugs': [], 'operator': 'IS' }, 'positionFilter': { 'positionSlugs': [], 'operator': 'IS' }, 'premiumFilter': { 'premiumStatus': [], 'operator': 'IS' } } }, 'operationName': 'problemsetPanelQuestionList',
    };

    try {
      const response = await post(url, body, {
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'cookie': (await this.secretManager.get('LEETCODE_CONFIG').then((res) => JSON.parse(res))).LEET_COOKIE,
          'origin': 'https://leetcode.com',
          'priority': 'u=1, i',
          'random-uuid': '00b3b94a-d622-baec-d6fa-77dbd29d94d3',
          'referer': 'https://leetcode.com/problems/',
          'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
          'sec-ch-ua-platform': '"Linux"',
          'sentry-trace': 'aadd23de586549d0b62e02c85c318cd5-b5d86e9245155ec0-0',
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
          'x-csrftoken': 'Yuj3H94eV7MNl7hAI1OeXAisL1CSkyvmuNauiTyJwJXQNGcvistoup1NwaNZxGZv',
        },
      });

      const problemDetails = response.data.question;
      console.info('problemDetails', JSON.stringify(problemDetails));
      await this.storeQuestion(problemDetails);
      return problemDetails;
    } catch (error: any) {
      console.error('Error fetching problem:', error);
    }
  }

}
