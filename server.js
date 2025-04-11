import express from "express";
import session from "express-session";

const app = express();


app.use(express.json);
app.use(express.urlencoded({extended:true}))

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));



const PORT  = process.env.PORT || 3001;
app.listen(PORT,()=>{
    console.log(`server is Running On Port${PORT}`);
    
});

