import express from 'express';
const app = express();
import Yup from 'yup';
import bodyParser from 'body-parser';
import models from './src/models/index.js';
import router from './src/routes/index.js';
import configs from './src/config/index.js';

// Use middleware body-parser
app.use(bodyParser.json());

// Syncronizing models with database tables comment this line
// models.sequelize
//   .sync({ alter: true })
//   .then(() => {
//     console.log(`Database connected and syncronized successfully!`);
//   })
//   .catch((error) => {
//     console.log('Error while syncronizing models.', error);
//   });

// Add routes
app.use(router);

// Hadling errors
app.use((error, req, res, next) => {
  if (error instanceof Yup.ValidationError) {
    return res.status(400).json({ message: error.message });
  }

  return res
    .status(error.statusCode || 500)
    .send({ message: error.message || 'Internal Server Error' });
});

app.listen(configs.port, () => {
  console.log(`Server started on port ${configs.port}`);
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
