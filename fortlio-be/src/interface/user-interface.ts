import { ObjectId } from 'mongodb';

export interface IUserCreate {
  fullName: string
  mobileNumber?: string
  email: string
  status: boolean
  roleId: string
}

export interface IUserUpdate {
  userId: string;
  fullName?: string;
  mobileNumber?: string;
  userPrivileges?: string[];
  email?: string;
  status?: boolean;
  roleId?: string;
}

export interface IPrivilege {
  name: string;
  code: string;
  tag: string[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRoleDoc extends Document {
  _id: ObjectId;
  roleName: string;
  description: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
  rolePrivileges: [string];
}

export interface IRole {
  roleId: string;
  roleName: string;
  description: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
  rolePrivileges: [string];
}

export interface IUserDoc extends Document {
  userId?: ObjectId;
  _id: ObjectId;
  fullName: string;
  status: boolean;
  email: string;
  roleId: ObjectId;
  userPrivileges: string[];
  isOnboarded: boolean;
  coins?: number;
  createdAt: Date;
  modifiedAt: Date;
}

export interface IUserPrivate {
  userId: string;
  provider: 'EMAIL' | 'GOOGLE' | 'GITHUB' // enum
  passwordHash: string
  emailVerified: boolean
  verificationTokenHash: string | undefined
  verificationTokenExpiresAt: Date | undefined
  refreshTokenHash: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserAccesstokenDetails {
  userId: ObjectId;
  name: string;
  email: string;
  roleId: ObjectId;
}