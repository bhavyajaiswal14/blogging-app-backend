//signin signup getAllUsers getUserById
import { Hono } from "hono";
import {Context} from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { signinSchema, signupSchema } from "../zod/user";
import { Jwt } from "hono/utils/jwt";
import { withAccelerate } from "@prisma/extension-accelerate";

//const prisma = new PrismaClient();

enum StatusCode {
    OK = 200,
    BADREQ = 400,
    NOTFOUND = 404,
    UNAUTH = 401,
    FORBIDDEN = 403,
    SERVERERR = 500,
}

export async function signup(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    try{
        const body:{
            username: string;
            email: string;
            password: string;
        }= await c.req.json();

        const parsed= signupSchema.safeParse(body);

        if(!parsed.success){
            return c.body('Invalid user input', StatusCode.BADREQ);
        }

        const UserExist= await prisma.user.findFirst({
            where: {
                email: body.email
            },
        });

        if(UserExist){
            return c.body('Email already exist', StatusCode.BADREQ);
        }

        const res = await prisma.user.create({
            data:{
                username: body.username,
                email: body.email,
                password: body.password,
            },
            })
            const userId = res.id;
            
            const token = await Jwt.sign({userId}, c.env.JWT_TOKEN);
            return c.json({
                msg: "User created successfully",
                token: token,
                user: {
                    userId: res.id,
                    username: res.username,
                    email: res.email,
                },
            });
        }catch(error){
            return c.body(`Internal server error`, StatusCode.SERVERERR);
    }
}

export async function signin(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    try{
        const body:{
            email: string;
            password: string;
        }= await c.req.json();

        const parsed= signinSchema.safeParse(body);

        if(!parsed.success){
            return c.body('Invalid user input', StatusCode.BADREQ);
        }

        const userExist = await prisma.user.findFirst({
            where: {
                email: body.email,
                password: body.password,
            },
        });
        if(userExist===null){
            return c.body('User not found', StatusCode.NOTFOUND);
        }
        const userId = userExist.id;
        
        const token = await Jwt.sign({userId}, c.env.JWT_TOKEN);
        return c.json({
            msg: "User logged in successfully",
            token: token,
            user: {
                userId: userExist.id,
                username: userExist.username,
                email: userExist.email,
            },
        });
    }catch(error){
        return c.body(`Internal server error`, StatusCode.SERVERERR);
    }   
}


export async function getAllUsers(c: Context) {
    
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    try{
    const res = await prisma.user.findMany();
    return c.json(res, StatusCode.OK)
    }
    catch(error){
    return c.body(`Internal server error`, StatusCode.SERVERERR);
    }

   
}

export async function getUserById(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    try{
        const res = await prisma.user.findUnique({
            where: {
                id: Number(c.req.param('id')),
            },
            include: {
                posts: true,
            },
        });
        if(res){
            return c.json({
                id: res.id,
                username: res.username,
                email: res.email,
                posts: res.posts,
            });
        }
    }catch(error){
            return c.body(`User not found`, StatusCode.NOTFOUND);
        }
    }
