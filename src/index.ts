import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { postRouter } from './routes/postRoutes';
import { tagRouter } from './routes/tagRoutes';
import { userRouter } from './routes/userRoutes';

const app = new Hono()

app.use(cors());
app.get('/', (c) => c.text( 'Welcome to Blogging App. Check the routes of backend' ));

app.route('/api/v1/user', userRouter);
app.route('/api/v1/posts', postRouter);
app.route('/api/v1/tags', tagRouter);

export default app;
