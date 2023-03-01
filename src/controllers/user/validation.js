import Yup from 'yup';

const registerSchema = Yup.object().shape({
  body: Yup.object().shape({
    firstName: Yup.string().required('First name is required.'),
    lastName: Yup.string().required('Last name is required.'),
    email: Yup.string().required('Email is required field.'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must contain at least 8 characters.')
      .max(16, 'Password must not contain more than 16 characters.'),
    confirmPassword: Yup.string()
      .required('Confirm password is required field.')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    mobileNumber: Yup.string().required().length(10),
    address: Yup.string().optional()
  })
});

const loginSchema = Yup.object().shape({
  body: Yup.object().shape({
    email: Yup.string().required('Email is required field.'),
    password: Yup.string().required('Password is required.').min(3)
  })
});

const refreshTokenShema = Yup.object().shape({
  body: Yup.object().shape({
    refresh_token: Yup.string().required('Refresh token required.')
  })
});

const userIdParamSchema = Yup.object().shape({
  params: Yup.object().shape({
    id: Yup.number('The must be positive number.')
      .min(1, 'The id should be greater than 0.')
      .required('User id in param required.')
  })
});

export { registerSchema, loginSchema, refreshTokenShema, userIdParamSchema };
