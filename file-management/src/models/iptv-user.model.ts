import mongoose, { Schema, Document } from 'mongoose';
import { IptvUser } from '../types';

export interface IIptvUserDocument extends IptvUser, Document {}

const IptvUserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  user_name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  ip: {
    type: String,
    required: true,
    trim: true,
  },
  mac: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  account_number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, {
  timestamps: true,
  collection: 'iptv_users',
  toJSON:{
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes for better performance
IptvUserSchema.index({ user_name: 1 });
IptvUserSchema.index({ email: 1 });
IptvUserSchema.index({ mac: 1 });
IptvUserSchema.index({ account_number: 1 });

export const IptvUserModel = mongoose.model<IIptvUserDocument>('IptvUser', IptvUserSchema);
