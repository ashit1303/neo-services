import { StatusCodes } from 'http-status-codes';
import { formatErrorMessage } from '../core-utils';
import mongoose, { FilterQuery, PipelineStage } from 'mongoose';
import { Db } from 'mongodb';
import { IFilter } from '../../interface/user-interface';
import { FILTER_CONSTANTS } from '../core-constants/common.constants';

export const getDataByFilter = async <T>(filterQuery: IFilter, basepipeline: PipelineStage[], searchFields: string[], model: mongoose.Model<T>) => {
  try {
    const { search = '', sortBy = 'createdAt', sortOrder = 'desc', page = FILTER_CONSTANTS.page, limit = FILTER_CONSTANTS.limit, filterKey, skip = ((page - 1) * limit) || 0, fromDate = '', toDate = '' } = filterQuery;
    const matchStage: FilterQuery<any> = filterKey ? { ...filterKey } : {};

    if (fromDate && toDate) {
      matchStage.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    if (search) {
      matchStage.$or = searchFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' }, // Case-insensitive search
      }));
    }

    // console.info('datePipeline', datePipeline);
    const pipeline: PipelineStage[] = [
      ...basepipeline,
      { $match: matchStage },
      { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } }, // Sorting
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }], // Paginated data
          totalCount: [{ $count: 'count' }], // Total count
        },
      },
    ];

    const result = await model.aggregate(pipeline).exec();

    const data: any[] = result[0]?.data || [];
    const totalCount = result[0]?.totalCount[0]?.count || 0;

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      totalCount,
      totalPages: totalPages,
      currentPage: page,
      hasPrev: page > 1,
      hasNext: page < totalPages,
    };
  } catch (error) {
    throw formatErrorMessage(error, StatusCodes.NO_CONTENT, { message: 'Failed to fetch data by filter query' });
  }
};

export const getDataByFilterSecondary = async <T>(filterQuery: IFilter, basepipeline: PipelineStage[], searchFields: string[], model: mongoose.Model<T>) => {
  try {
    const { search = '', sortBy = 'createdAt', sortOrder = 'desc', page = FILTER_CONSTANTS.page, limit = FILTER_CONSTANTS.limit, filterKey, skip = ((page - 1) * limit) || 0, fromDate = '', toDate = '' } = filterQuery;
    const matchStage: FilterQuery<any> = filterKey ? { ...filterKey } : {};

    if (fromDate && toDate) {
      matchStage.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    if (search) {
      matchStage.$or = searchFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' }, // Case-insensitive search
      }));
    }

    const pipeline: PipelineStage[] = [
      ...basepipeline,
      { $match: matchStage },
      { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } }, // Sorting
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }], // Paginated data
          totalCount: [{ $count: 'count' }], // Total count
        },
      },
    ];

    const result = await model.aggregate(pipeline).read('secondary').exec();
    const data: any[] = result[0]?.data || [];
    const totalCount = result[0]?.totalCount[0]?.count || 0;

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      totalCount,
      totalPages: totalPages,
      currentPage: page,
      hasPrev: page > 1,
      hasNext: page < totalPages,
    };
  } catch (error) {
    throw formatErrorMessage(error, StatusCodes.NO_CONTENT, { message: 'Failed to fetch data by filter query' });
  }
};

export const runQueryMongoDriverSecondary = async (mongoDB: Db, collectionName: string, basepipeline: PipelineStage[]) => {
  try {

    return await mongoDB.collection(collectionName).aggregate(basepipeline).toArray();

  } catch (error) {
    throw formatErrorMessage(error, StatusCodes.NO_CONTENT, { message: 'Failed to fetch data by filter query' });
  }
};

export const getDataWithLookupsAfterFilter = async <T>(filterQuery: IFilter, basepipeline: PipelineStage[], lookupPipeline: any[], searchFields: string[], model: mongoose.Model<T>) => {
  try {
    const { search = '', sortBy = 'createdAt', sortOrder = 'desc', page = FILTER_CONSTANTS.page, limit = FILTER_CONSTANTS.limit, filterKey, skip = ((page - 1) * limit) || 0, fromDate = '', toDate = '' } = filterQuery;
    const matchStage: FilterQuery<any> = filterKey ? { ...filterKey } : {};

    if (fromDate && toDate) {
      matchStage.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    if (search) {
      matchStage.$or = searchFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' }, // Case-insensitive search
      }));
    }

    // console.info('datePipeline', datePipeline);
    const pipeline: PipelineStage[] = [
      ...basepipeline,
      { $match: matchStage },
      { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
      {
        $facet: {
          data: [ // Sorting
            { $skip: skip },
            { $limit: limit },
            ...lookupPipeline,
          ], // Paginated data
          totalCount: [{ $count: 'count' }], // Total count
        },
      },
    ];

    const result = await model.aggregate(pipeline).exec();

    const data: any[] = result[0]?.data || [];
    const totalCount = result[0]?.totalCount[0]?.count || 0;

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      totalCount,
      totalPages: totalPages,
      currentPage: page,
      hasPrev: page > 1,
      hasNext: page < totalPages,
    };
  } catch (error) {
    throw formatErrorMessage(error, StatusCodes.NO_CONTENT, { message: 'Failed to fetch data by filter query' });
  }
};

