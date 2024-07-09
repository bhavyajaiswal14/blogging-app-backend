import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { Context } from "hono";
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

export async function getTags(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    try{
        const res= await prisma.tags.findMany();
        return c.json({
            tags: res,
        });
    }catch(error){
        return c.body(`Internal server error`, StatusCode.SERVERERR);
    }
}

export async function getPostsByTag(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    try{
        const res= await prisma.tags.findMany({
            where: {
                tag: String(c.req.param('tag')),
            },
            select: {
                post: {
                    select: {
                        User: { select: { username: true } },
                        id: true,
                        userId: true,
                        title: true,
                        description: true,
                        createdAt: true,
                    },
                },
            },
        });
        return c.json({
            posts: res[0].post.map((post) => ({
                username: post.User.username,
                id: post.id,
                title: post.title,
                userId: post.userId,
                description: post.description,
                createdAt: post.createdAt,
            })),
        });
    }catch(error){
        return c.body(`Internal server error`, StatusCode.SERVERERR);
    }
}