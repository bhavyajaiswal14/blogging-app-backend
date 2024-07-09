import { Hono } from "hono";
import { 
    createPost, 
    deletePostById, 
    getAllPosts, 
    getPostById, 
    getUserPosts, 
    updatePost 
} from '../controller/postController';
import { authmiddleware } from '../middleware/middleusers';

export const postRouter = new Hono();

postRouter.get('/all-posts', getAllPosts);
postRouter.get('/user-posts', authmiddleware, getUserPosts);
postRouter.post('/create-post', authmiddleware, createPost);

postRouter.get('/:id', authmiddleware, getPostById);

postRouter.put('/update/:id', authmiddleware, updatePost);
postRouter.delete('/delete/:id', authmiddleware, deletePostById);
