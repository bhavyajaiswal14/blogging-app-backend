import { Hono } from "hono";
import { 
    getAllUsers, 
    signin, 
    signup, 
    getUserById
} from '../controller/userController';
import { authmiddleware } from '../middleware/middleusers';

export const userRouter = new Hono();

userRouter.post('/signup', signup);
userRouter.post('/signin', signin);

userRouter.get('/allusers',  getAllUsers);
userRouter.get('/:id', authmiddleware, getUserById);
