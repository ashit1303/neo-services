import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import { TYPSENSE_COLLECTION_NAME } from '../../core/core-constants/common.constants';

export const candidateTypesenseSchema: CollectionCreateSchema = {
  name: TYPSENSE_COLLECTION_NAME.CANDIDATES,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'userId', type: 'string', index: true },
    { name: 'fullName', type: 'string', index: true },
    { name: 'email', type: 'string', index: true },
    { name: 'skills', type: 'string[]', index: true, optional: true },
    { name: 'experience', type: 'float', index: true, optional: true },
    { name: 'bio', type: 'string', index: true, optional: true },
    { name: 'blogKeywords', type: 'string', index: true, optional: true },
  ],
};
