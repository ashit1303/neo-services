import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from '@aws-sdk/client-bedrock-agent-runtime';
import { config } from '../../config';
import { secretManger } from '../clients';
import { fmtErr } from '../core/core-utils/err-util';

class FortiLLMService {

  async getAnswerFromKnowledgeBase(question: string, orchestrationPrompt: string, generationPrompt: string) {
    try {
      const obiLLMSecrets = await secretManger.get('OBI_LLM').then((res) => JSON.parse(res));

      const client = new BedrockAgentRuntimeClient({ region: config.awsRegion });

      const command = new RetrieveAndGenerateCommand({
        input: { text: question },
        retrieveAndGenerateConfiguration: {
          type: 'KNOWLEDGE_BASE',
          knowledgeBaseConfiguration: {
            knowledgeBaseId: obiLLMSecrets.KNOWLEDGE_BASE_ID,
            modelArn: obiLLMSecrets.KNOWLEDGE_BASE_MODEL_ARN || obiLLMSecrets.INFERENCE_PROFILE_ARN,
            orchestrationConfiguration: {
              promptTemplate: { textPromptTemplate: orchestrationPrompt },
            },
            generationConfiguration: {
              promptTemplate: { textPromptTemplate: generationPrompt },
            },
          },
        },
      });

      return { command, client };
    } catch (error) {
      throw fmtErr(error, { msg: 'Failed to get answer from knowledge base', apiName: 'getAnswerFromKnowledgeBase' });
    }
  }
}

export default FortiLLMService;

// 'KNOWLEDGE_BASE_MODEL_ARN': 'amazon.nova-2-lite-v1:0'
// obiLLMSecrets = {'KNOWLEDGE_BASE_ID': 'E080LUB4DR','INFERENCE_PROFILE_ARN': 'arn:aws:bedrock:ap-south-1:977098996366:inference-profile/global.amazon.nova-2-lite-v1:0'};
// obiLLMSecrets = { 'KNOWLEDGE_BASE_ID': 'E080LUB4DR', 'KNOWLEDGE_BASE_MODEL_ARN': 'google.gemma-3-12b-it' };