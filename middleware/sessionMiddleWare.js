import session from 'express-session';

const sessionMiddleware = session({

    secret: process.env.SESSION_SECRET || 'defaultSecret', // use env variable
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // true if using HTTPS
      maxAge: 1000 * 60 * 60, // 1 hour (optional)
    }
  
 
  });

export default sessionMiddleware;