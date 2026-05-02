import axios from 'axios';
import DsaQuestions from '../models/dsa-quests.model';
import DsaAnswer from '../models/dsa-answers.model';
import { ICodeLang } from '../interface/leetcode.interface';
import { SecretManager } from '../core/core-clients/secret-manager.client';
import { Config } from '../interface';
import { OllamaClient } from '../core/core-clients/ollama.client';
import { cleanHTML } from '../core/core-utils';

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

  async handleExtraSlugs(slugsList: string[]): Promise<void> {
    if (!slugsList || slugsList.length === 0) {
      console.info('No extra slugs to store');
      return; // Handle empty input gracefully
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
      return Promise.resolve();
    } catch (error) {

      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('Unknown error', error);
      }
      return Promise.resolve();
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
    } catch (error) {
      console.error('Error While Storing Quests Answer', error.message, { questionId, codelang });
      return Promise.resolve();
    }
  }

  async storeQuestion(data: any) {
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

  }

  async getQuestFromDB(slug: string): Promise<any> {
    // return this.typeorm.getRepository(Quests).findOne({ where: { titleSlug: url } });
    // return await this.typeorm.getRepository(Quests).findOne({ where: { titleSlug: slug, questionId: null } });
    return DsaQuestions.findOne({ titleSlug: slug }).lean();
  }
  async getQuestAnsFromDB(slug: string, codeLang: ICodeLang): Promise<any> {
    const [quesiton] = await DsaQuestions.aggregate([
      { $match: { titleSlug: slug } },
      {
        $lookup: {
          from: 'questsanswers',
          let: { qId: '$questionId' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$questionId', '$$qId'] }, { $eq: ['$codeLang', codeLang] }] } } },
          ],
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
      const response = await axios.post(url, query, {
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

      const problemDetails = response.data.data.question;
      console.info('problemDetails', JSON.stringify(problemDetails));
      await this.storeQuestion(problemDetails);
      return problemDetails;
    } catch (error) {
      this.logger.error('Error fetching problem:', error.message);
      return Promise.resolve();
    }
  }

  async getExplanation(codeLang: ICodeLang, questionDescription: string, questionId: string) {
    const explainPromt = `Give only optimed code, explanation, time and space complexity in ${codeLang}`;
    const llmRes = await this.ollama.generateResponse(explainPromt + ' ' + questionDescription);
    this.storeQuestsAnswer(llmRes, codeLang, questionId);
    return llmRes;
  }

  async sloveSlugInGivenLang(slug: string, codeLang: ICodeLang) {
    try {
      let dbQuestion = await this.fetchQuestionDetailsFromLeetCode(slug);
      const questionId = dbQuestion.questionId;

      dbQuestion = `Problem Title: ${dbQuestion.questionTitle}\n Problem Statement:\n${dbQuestion.cleanedContent || dbQuestion.content}`;
      dbQuestion = JSON.stringify(dbQuestion);
      return this.getExplanation(codeLang, dbQuestion, questionId);
    } catch (error) {
      console.error('Error While Solving Question in Given Lang', error, { slug, codeLang });
      return Promise.resolve();
    }
  }

  async getUnsolvedQuests() {
    return DsaQuestions.findOne({ questionId: null });
  }

  async getQuestByIds(ids: string[]) {
    return DsaQuestions.aggregate([{ $match: { questionId: { $in: ids } } }]);
  }

  async fetchQuestionLists(skip: string) {
    const url = 'https://leetcode.com/graphql';
    const query = {
      'query': ' query problemsetPanelQuestionList($filters: QuestionFilterInput, $searchKeyword: String, $sortBy: QuestionSortByInput, $categorySlug: String, $limit: Int, $skip: Int) { problemsetPanelQuestionList( filters: $filters searchKeyword: $searchKeyword sortBy: $sortBy categorySlug: $categorySlug limit: $limit skip: $skip ) { questions { id titleSlug title translatedTitle questionFrontendId paidOnly difficulty topicTags { name slug nameTranslated } status isInMyFavorites frequency acRate } totalLength finishedLength panelName hasMore }} ', 'variables': { 'skip': skip, 'limit': 100, 'categorySlug': '', 'filters': { 'filterCombineType': 'ALL', 'statusFilter': { 'questionStatuses': [], 'operator': 'IS' }, 'difficultyFilter': { 'difficulties': [], 'operator': 'IS' }, 'languageFilter': { 'languageSlugs': [], 'operator': 'IS' }, 'topicFilter': { 'topicSlugs': [], 'operator': 'IS' }, 'acceptanceFilter': {}, 'frequencyFilter': {}, 'lastSubmittedFilter': {}, 'publishedFilter': {}, 'companyFilter': { 'companySlugs': [], 'operator': 'IS' }, 'positionFilter': { 'positionSlugs': [], 'operator': 'IS' }, 'premiumFilter': { 'premiumStatus': [], 'operator': 'IS' } }, 'searchKeyword': '', 'sortBy': { 'sortField': 'CUSTOM', 'sortOrder': 'ASCENDING' }, 'options': { 'enabled': true }, 'filtersV2': { 'filterCombineType': 'ALL', 'statusFilter': { 'questionStatuses': [], 'operator': 'IS' }, 'difficultyFilter': { 'difficulties': [], 'operator': 'IS' }, 'languageFilter': { 'languageSlugs': [], 'operator': 'IS' }, 'topicFilter': { 'topicSlugs': [], 'operator': 'IS' }, 'acceptanceFilter': {}, 'frequencyFilter': {}, 'lastSubmittedFilter': {}, 'publishedFilter': {}, 'companyFilter': { 'companySlugs': [], 'operator': 'IS' }, 'positionFilter': { 'positionSlugs': [], 'operator': 'IS' }, 'premiumFilter': { 'premiumStatus': [], 'operator': 'IS' } } }, 'operationName': 'problemsetPanelQuestionList',
    };

    try {
      const response = await axios.post(url, query, {
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

      const problemDetails = response.data.data.question;
      console.info('problemDetails', JSON.stringify(problemDetails));
      await this.storeQuestion(problemDetails);
      return problemDetails;
    } catch (error) {
      console.error('Error fetching problem:', error);
    }
  }
  // async updateSonicSearchForQuestions(){
  //   const questions = await this.typeorm.getRepository(Quests).find( {select: ['id', 'questionTitle']} );
  //   for (const question of questions) {
  //     this.smoothSearch.push(this.configService.get('DOMAIN'),'leetcode',JSON.stringify(question), question.questionTitle);
  //   }
  // }

  // async indexEntityColumn(entityId: number, columnName: string, columnValue: string): Promise<string> {
  //   const bucket = 'your_bucket'; // Define your Sonic bucket
  //   const collection = 'your_collection'; // Define your Sonic collection
  //   try {
  //     // Sanitize the text. Sonic best practices.
  //     const sanitizedText = columnValue.replace(/[^a-zA-Z0-9\s]/g, '');

  //     // Ingest the data into Sonic.
  //     await this.sonicChannel.ingest(bucket, collection, entityId.toString(), columnName, {
  //       lang: 'en', // Specify language if needed
  //     });

  //     return entityId.toString(); // Return the entity ID (used as object ID in sonic)
  //   } catch (error) {
  //     console.error('Error indexing entity column in Sonic:', error);
  //     throw error; // Rethrow the error for handling elsewhere
  //   }
  // }

}
