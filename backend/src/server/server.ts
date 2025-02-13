// src/server/server.ts
import express from 'express';
import cors from 'cors';
import loginRouter from '../routes/login';
import registerRouter from '../routes/register';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/login', loginRouter);
app.use('/api/register', registerRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});