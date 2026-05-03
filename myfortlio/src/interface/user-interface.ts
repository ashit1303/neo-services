import { ObjectId } from 'mongodb';

export interface IUserCreate {
  firstName: string
  lastName: string
  mobileNumber?: string
  email: string
  status: boolean
  roleId: string
}

export interface IUserUpdate {
  userId: string;
  firstName?: string;
  lastName?: string;
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
  firstName: string;
  lastName: string;
  status: boolean;
  mobileNumber: string;
  email: string;
  roleId: ObjectId | IRoleDoc;
  userPrivileges: string[];
  createdBy: string;
  modifiedBy: string;
  createdDate: Date;
  modifiedDate: Date;
  coinBalance: number;
}

export interface IUserAccesstokenDetails {
  userId: string;
  name: string;
  role: string;
}