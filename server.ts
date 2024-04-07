import express from "express";
import { type Request, type Response, type NextFunction,type ErrorRequestHandler } from "express";
import bodyParser from "body-parser";
import apiRouter  from './apiRouter'

//init express application
const app =  express();
//middlwares
app.use(bodyParser.json({limit:'2mb'}))

//routing Routes
app.use('/api',apiRouter)


//wrong path managment
app.use((req,res,next)=>{
 res.status(404).send({success:"false",message:'not Found'})
})
//error handling
const errorHandler:ErrorRequestHandler= (err:any,req:Request,res:Response,next:NextFunction)=>{
 const statusCode=err.statusCode || 500
 const message=err.message||"server error"
 res.status(statusCode).send({success:'false',message:`${message}`})
}
app.use(errorHandler)
// running the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log(`server is running on port ${PORT}`);
});