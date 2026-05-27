import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import { TYPSENSE_COLLECTION_NAME } from '../../core/core-constants/common.constants';

export const dsaQuestionsTypesenseSchema: CollectionCreateSchema = {
  name: TYPSENSE_COLLECTION_NAME.DSA_QUESTIONS,
  fields: [
    { name: 'id', type: 'string' }, // Mongoose _id
    { name: 'titleSlug', type: 'string', index: true }, // Searched
    { name: 'questionTitle', type: 'string', index: true }, // Searched
    { name: 'difficulty', type: 'string', facet: true, index: true, optional: true }, // Filtered
    { name: 'categoryTitle', type: 'string', facet: true, index: true, optional: true }, // Filtered
  ],
};
