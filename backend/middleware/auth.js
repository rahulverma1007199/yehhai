import 'dotenv/config';
import jwt from "jsonwebtoken";
import {Users} from "../db/models/index.model.js";

export const verifyJWT = (req,res,next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if(token == null){
        return res.status(401).json({"error":"No access token"});
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY ,async (err,user)=>{
        if(err){
            return res.status(403).json({"error":"Invalid access token"});
        }

        const userId = user?.id;
        const userData = userId && await Users.findOne({where:{id:userId}});
        if(!userData){
            return res.status(404).json({"error":"User not found"})
        }
        req.user = userData;
        next();
    });
}