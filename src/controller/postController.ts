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

export async function getAllPosts(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    try{
        const response=await prisma.posts.findMany({
        include:{
            tags: true,
            User: true,
        }
    });
    return c.json({
        posts: response.map((post)=>({
            id: post.id,
            username: post.User.username,
            userId: post.User.id,
            title: post.title,
            description: post.description,
            tags: post.tags,
            createdAt: post.createdAt
        })),
    });
}catch(error){
    return c.body(`Internal server error`, StatusCode.SERVERERR);
}
}

export async function getPostById(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    try{
        const id:number=Number(c.req.param("id"));

        const postExist=await prisma.posts.findFirst({
            where:{
                id: id,
                userId: c.get("userId").userId,
            },
            include:{
                tags: true,
            },
        });
        if(!postExist){
            return c.body('Post not found', StatusCode.NOTFOUND);
        }
        return c.json({
            data:{
                id: postExist.id,
                title: postExist.title,
                description: postExist.description,
                tags: postExist.tags,
                createdAt: postExist.createdAt,
            },
        });
    }catch(error){
        return c.body(`Internal server error`, StatusCode.SERVERERR);
}
}

export async function getUserPosts(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    try{
        const res=await prisma.posts.findMany({
            where:{
                userId: c.get("userId").userId,
            },
        });
        return c.json({
            posts: res,
        });
    }catch(error){
        return c.body(`Internal server error`, StatusCode.SERVERERR);
}
}

export async function createPost(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    try{
        const body:{
            title: string;
            description: string;
            tags: string;
        }=await c.req.json();

        const tagName=body.tags.split(",").map((tag)=>tag.trim());

        if(body.description && body.title==null){
            return c.body('Invalid user input', StatusCode.BADREQ);
        }
         
        const res=await prisma.posts.create({
            data:{
                title: body.title,
                description: body.description,
                userId: c.get("userId").userId,
                tags:{
                    connectOrCreate: tagName.map((tag)=>({
                        where:{tag},
                        create:{tag},
                    })),
                },
            },
            include:{
                tags: true,
            },
        });
        return c.json({
            message: "Post created successfully",
            post:{
                id: res.id,
                title: res.title,
                description: res.description,
                tags: res.tags.map((tag)=>tag.tag),
                createdAt: res.createdAt,
            },
        });
}catch(error){
    return c.body(`Internal server error`, StatusCode.SERVERERR);
}
}

export async function updatePost(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    try{
        const id:number=Number(c.req.param("id"));

        const body:{
            title: string;
            description: string;
            tags: string;
        }=await c.req.json();

        const tagName=body.tags.split(",").map((tag)=>tag.trim());

        const postExist=await prisma.posts.findFirst({
            where:{
                id: id,
                userId: c.get("userId").userId,
            },
        });
        if(!postExist){
            return c.body('Post not found', StatusCode.NOTFOUND);
        }

        const res=await prisma.posts.update({
            where:{
                id:id,
                userId: c.get("userId").userId,
            },
            data:{
                title: body.title,
                description: body.description,
                tags:{
                    connectOrCreate: tagName.map((tag)=>({
                        where:{tag},
                        create:{tag},
                    })),
                },
    },
    include: {
        tags: true,
    },
    });
    return c.json({
        data:{
            id: res.id,
            title: res.title,
            description: res.description,
            tags: res.tags,
            createdAt: res.createdAt,
        },
    });
}catch(error){
    return c.body(`Internal server error`, StatusCode.SERVERERR);
}
}

export async function deletePostById(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    try{
        const postId=Number(c.req.param("id"));
        const postExist=await prisma.posts.findFirst({
            where:{
                id: postId,
                userId: c.get("userId").userId,
            },
        });
        if(!postExist){
            return c.body('Post not found', StatusCode.NOTFOUND);
        }

        const res=await prisma.posts.delete({
            where:{
                id: postId,
                userId: c.get("userId").userId,
            },
        });
        return c.json({
            msg: "Post deleted successfully",
        });
        }catch(error){
            return c.body(`Internal server error`, StatusCode.SERVERERR);
    }
}

