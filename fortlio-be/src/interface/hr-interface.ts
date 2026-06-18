import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface IHrCreate {
  fullName: string;
  email: string;
  mobileNumber?: string;
  companyName?: string;
  companyWebsite?: string;
  designation?: string;
}

export interface IHrUpdate {
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  companyName?: string;
  companyWebsite?: string;
  designation?: string;
}

export interface IHrDoc extends Document {
  _id: ObjectId;
  userId: ObjectId | any;
  mobileNumber?: string;
  companyName?: string;
  companyWebsite?: string;
  designation?: string;
  createdAt: Date;
  updatedAt: Date;
}
