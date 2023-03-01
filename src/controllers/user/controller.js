import models from '../../models/index.js';
import Sequelize from 'sequelize';
const Op = Sequelize.Op;
import * as bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import configs from '../../config/index.js';

const register = async (req, res) => {
  const inputData = req.body;
  try {
    await models.user.create({
      first_name: inputData.firstName,
      last_name: inputData.lastName,
      email: inputData.email,
      mobile_number: inputData.mobileNumber,
      password: inputData.password,
      address: inputData.address
    });

    res.send({
      message: 'User created successfully.'
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({
        statusCode: 400,
        message: `There is already an user exists with email ${inputData.email}`
      });
    }

    res.status(500).send({
      message: 'Something went wrong while registering.'
    });
  }
};

const login = async (req, res) => {
  const loginData = req.body;
  try {
    const user = await models.user.findOne({
      where: { email: loginData.email }
    });

    if (!user) {
      return res.status(400).send({
        message: `User with email ${loginData.email} has not found.`
      });
    }

    const isValidPassword = await bcrypt.compare(
      loginData.password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(400).send({
        message: `Either email or password is incorrect.`
      });
    }

    const access_token = getToken({
      id: user.id,
      email: user.email
    });

    const refresh_token = getToken(
      {
        id: user.id,
        email: user.email
      },
      'refresh'
    );

    await models.user.update(
      {
        access_token,
        refresh_token
      },
      { where: { id: user.id } }
    );

    res.send({
      access_token,
      refresh_token
    });
  } catch (error) {
    res.status(500).send({
      message: 'An error occured while login.'
    });
  }
};

const logout = async (req, res) => {
  try {
    await models.user.update(
      {
        access_token: null,
        refresh_token: null
      },
      {
        where: { id: req.user.id }
      }
    );
    res.send({
      message: ' You loged out successfully.'
    });
  } catch (error) {
    res.send({
      message: 'Something went wrong while logging out.'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const inputData = req.body;
    // Verify token;
    let payload;
    JWT.verify(
      inputData.refresh_token,
      configs.refresh_token_key,
      (error, data) => {
        // If any error on verifying token then return
        if (error) return;
        // If no error on verifying token then update payload variable with data(token payload)
        payload = data;
      }
    );
    // If payload is undefind then throw error
    if (!payload) {
      return res.status(400).send({
        message: 'The given refresh token is invalid/expired.'
      });
    }
    const user = await models.user.findOne({
      where: { email: payload.email, id: payload.id }
    });
    if (!user) {
      return res.send({
        message: `user not found with ${payload.email} "and id" ${payload.id}`
      });
    }
    //New access token for few more minutes
    const access_token = getToken({
      id: user.id,
      email: user.email
    });

    await models.user.update({ access_token }, { where: { id: user.id } });

    res.send({
      access_token
    });
  } catch (error) {
    res.status(500).send({
      message: 'An error occured while refreshing token.'
    });
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await models.user.findOne({
      where: { id }
    });
    if (!user) {
      return res.status(404).send({
        message: `The given user could not be found.`
      });
    }

    res.send({
      data: {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        mobile: user.mobile_number,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).send({
      message: 'Something went wrong while fetching user.'
    });
  }
};

const updateOne = async (req, res) => {
  const inputData = req.body;
  const { id } = req.params;

  const fieldsToUpdate = {};
  if (inputData.firstName) fieldsToUpdate.first_name = inputData.firstName;
  if (inputData.lastName) fieldsToUpdate.last_name = inputData.lastName;
  if (inputData.email) fieldsToUpdate.email = inputData.email;
  if (inputData.password) fieldsToUpdate.password = inputData.password;
  if (inputData.mobile) fieldsToUpdate.mobile_number = inputData.mobile;
  if (inputData.address) fieldsToUpdate.address = inputData.address;

  try {
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).send({
        message: `Please provide at least one field to update`
      });
    }

    const user = await models.user.findOne({
      where: { id }
    });

    if (!user) {
      return res.status(400).send({
        message: `There is no user with the given ID.`
      });
    }
    Object.keys(fieldsToUpdate).forEach((column_name) => {
      user[column_name] = fieldsToUpdate[column_name];
    });

    await user.save();

    res.send({
      message: 'User updated successfully.'
    });
  } catch (error) {
    res.status(500).send({
      message: 'Something went wrong while updating user.'
    });
  }
};

const list = async (req, res) => {
  try {
    let { page, limit, order, orderBy, filter } = req.query;
    page = page ? parseInt(page) : 0;
    limit = limit ? parseInt(limit) : 5;
    if (!order) order = 'ASC';
    if (!orderBy) orderBy = 'first_name';

    const where = filter
      ? {
          [Op.or]: {
            first_name: {
              [Op.like]: `%${filter}%`
            },
            last_name: {
              [Op.like]: `%${filter}%`
            },
            email: {
              [Op.like]: `%${filter}%`
            },
            mobile_number: {
              [Op.like]: `%${filter}%`
            }
          }
        }
      : {};
    const { count, rows } = await models.user.findAndCountAll({
      where,
      offset: page * limit,
      limit,
      order: [[orderBy, order]]
    });

    const pagination = {
      currentPage: page,
      totalPage: Math.ceil(count / limit),
      totalItem: count
    };

    res.send({
      pagination,
      items: rows.map((item) => {
        return {
          firstName: item.first_name,
          lastName: item.last_name,
          email: item.email,
          mobile: item.mobile_number,
          address: item.address
        };
      })
    });
  } catch (error) {
    res.status(500).send({
      message: 'There is an error while fetching user list.'
    });
  }
};

const getToken = (payload, type = 'access') => {
  if (type === 'access')
    return JWT.sign(payload, configs.access_token_key, {
      expiresIn: `${configs.access_token_expire_minutes}m`
    });

  return JWT.sign(payload, configs.refresh_token_key, {
    expiresIn: `${configs.refresh_token_expire_days}d`
  });
};

export { register, login, refreshToken, logout, getOne, updateOne, list };
