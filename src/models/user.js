'use strict';
import { Model } from 'sequelize';
import * as bcrypt from 'bcrypt';
import configs from '../config/index.js';

const userModel = (sequelize, DataTypes) => {
  class user extends Model {
    static associate(models) {}
  }

  user.init(
    {
      first_name: {
        type: DataTypes.UUID,
        allowNull: false
      },
      last_name: {
        type: DataTypes.UUID,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mobile_number: {
        type: DataTypes.STRING
      },
      address: {
        type: DataTypes.STRING
      },
      access_token: {
        type: DataTypes.STRING
      },
      refresh_token: {
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: 'user',
      tableName: 'users',
      createdAt: 'created_on',
      updatedAt: 'updated_on'
    }
  );

  user.beforeSave(async (user) => {
    try {
      const salt = await bcrypt.genSalt(configs.password_salt_round);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      user.password = hashedPassword;
    } catch (error) {
      console.log('Password could not be encrypted.', error);
    }
  });

  return user;
};

export default userModel;
