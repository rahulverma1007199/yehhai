import express from "express";
import postRoutes from './routes/posts.js';
import authRoutes from './routes/auth.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import {fileURLToPath} from 'url';
import path from 'path';
import {dirname} from 'path';



const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname,'public')))
app.use('/static',express.static('public'))

const storage  = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"./public/images")
    },
    filename: function(req,file,cb){
        cb(null,Date.now()+ file.originalname)
    }
});

const upload = multer ({storage});
app.post('/api/upload', upload.single("file"), function (req,res){
    const file = req.file;
    res.header({'Access-Control-Allow-Origin':"http://localhost:3000"}).status(200).json(file.filename);
});

app.use(express.json());  
app.use(cors());
app.use(cookieParser());
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);

app.listen(8800,()=>{
    console.log("Connected")
});