import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface ICandidateCreate {
  fullName: string;
  email: string;
  mobileNumber?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  experience?: number;
  bio?: string;
}

export interface ICandidateUpdate {
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  experience?: number;
  bio?: string;
}

export interface ICandidateDoc extends Document {
  _id: ObjectId;
  userId: ObjectId | any;
  mobileNumber?: string;
  skills: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  experience?: number;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICandidateBlogCreate {
  title: string;
  content: string;
  blogKeywords?: string[];
  status?: 'draft' | 'published';
}

export interface ICandidateBlogUpdate {
  title?: string;
  content?: string;
  blogKeywords?: string[];
  status?: 'draft' | 'published';
}

export interface ICandidateBlogDoc extends Document {
  _id: ObjectId;
  candidateId: ObjectId;
  title: string;
  content: string;
  blogKeywords: string[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}
