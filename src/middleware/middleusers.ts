// import { Hono } from "hono";
// import { Context, Next } from "hono";
// import { Jwt } from "hono/utils/jwt";

// export async function authmiddleware(c: any, next: Next) {

//     const authHeader = c.req.header("authorization");
//     const token: string = authHeader.split(" ")[1];
//         console.log("token", token);
//     try{
        
//         if(token !== null || token !== undefined){
//             const decode= await Jwt.verify(token, c.env.JWT_TOKEN);
//             if(decode){
//                 c.set("userId", decode);
//                 console.log("decode", decode);
//                 await next();
//             }else{
//                 return c.body("you are unauthroized user sorry", 401);
//             }
//         }else{
//             return c.body("you are unauthroized user", 401);
//         }
//     }catch(error){
//         return c.body("unauthroized ", 401);
//     }
// }

import { Next } from "hono";
import {Jwt} from 'hono/utils/jwt';

export async function authmiddleware(c:any, next : Next){
        

        const authHeader: string = c.req.header('authorization') || '';
        const token : string = authHeader.split(' ')[1];
        console.log("token", token);

       
        
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            c.body('Please Signin' ,403);
        }
        try{
            const decoded = await Jwt.verify(token ,c.env.JWT_TOKEN); 
            c.set("userId", decoded); 
            console.log("decoded",decoded);

            await next();
    
        } catch(error){
            return c.body('Unauthorised user',403);
        } 
}