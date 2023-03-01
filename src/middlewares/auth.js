import JWT from 'jsonwebtoken';
import configs from '../config/index.js';
import models from '../models/index.js';

const auth = async (req, res, next) => {
  try {
    // Get token from headers
    let token = req?.headers?.authorization;
    // If token does not exist then throw error
    if (!token) {
      return res.status(400).send({
        message: 'You must login to perform this action.'
      });
    }
    // If token exists but the first 7 character is not 'Bearer ' then throw error
    if (token.substring(0, 7) !== 'Bearer ') {
      return res.status(400).send({
        message: 'The given authorization token is invalid.'
      });
    }
    // Replace token variable by geting token text after 'Bearer '
    token = token.substring(7);

    // Initialize payload variable with undefined value
    let payload;
    let tokenError;
    // Verify token
    JWT.verify(token, configs.access_token_key, (error, data) => {
      // If any error on verifying token then return
      if (error) {
        tokenError = error.name;
        return;
      }
      // If no error on verifying token then update payload variable with data(token payload)
      payload = data;
    });

    // If payload is undefind then throw error
    if (!payload) {
      if (tokenError === 'TokenExpiredError') {
        return res.status(400).send({
          message: 'The given authorization token has expired.'
        });
      }
      return res.status(400).send({
        message: 'The given authorization token is invalid.'
      });
    }
    // Check in user table if user exists based on email and id, getting from token payload
    const isUserExist = await models.user.findOne({
      where: {
        email: payload.email,
        id: payload.id
      }
    });
    // If user does not exist then throw error
    if (!isUserExist) {
      return res.status(400).send({
        message: 'The given authorization token is invalid.'
      });
    }
    // Add user property in req with user data
    req.user = isUserExist;
    // Execute further codes
    return next();
  } catch (error) {
    return res.status(400).send({
      message: 'Something went wrong while authenticating token'
    });
  }
};

export default auth;
