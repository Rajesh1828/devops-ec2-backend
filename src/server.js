import express from "express";
import dotenv from "dotenv";
dotenv.config();




const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Hello World");
})

app.get("/api/health",(req,res)=>{
    res.send("Hello from API");
})

app.get("/api/users",(req,res)=>{
    const users =[
        {id:1,name:"John"},
        {id:2,name:"Jane"},
        {id:3,name:"Bob"}
    ]
    res.status(200).json({success:true,data:users})
})

app.get("/api/users/:id",(req,res)=>{
    const {id} = req.params;
    const users =[
        {id:1,name:"John"},
        {id:2,name:"Jane"},
        {id:3,name:"Bob"}
    ]
    const user = users.find((user)=>user.id === parseInt(id));
    if(!user){
        return res.status(404).json({
            success:false,
            message:"User not found"
        })

    }else{
        return res.status(200).json({
            success:true,
            data:user
        })
    }
})


app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})


