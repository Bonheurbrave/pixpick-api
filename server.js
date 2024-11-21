const express = require("express");
const cors = require("cors");
const mysql2 = require("mysql2/promise");
const multer = require("multer");
const fs = require("fs");
const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//dbconfigurations
const db = mysql2.createPool({
  host: "sql12.freesqldatabase.com",
  user: "sql12746383",
  password: "Hm8vNXru5L",
  database: "sql12746383",
});

//singup route

app.post("/register", async (req, res) => {
  const data = req.body;
  console.log(data);
  const { username, email, password } = data;
  try {
    await db
      .query("select * from users where email = ?", [email])
      .then((result) => {
        if (result[0].length > 0) {
          res.send("userexists");
        } else {
          db.query(
            "insert into users (usernames , email , password) values (?, ?,?)",
            [username, email, password]
          )
          res.send("inserted") 
        }
      });
  } catch (error) {}
});

//login route
app.post("/login", async (req, res) => {
  const data = req.body;
  const { email, password } = data;
  console.log(data);

  try {
    await db
      .query("select * from users where email= ? and password = ?", [
        email,
        password,
      ])
      .then((result) => {
        if (result[0].length > 0) {
          res.send("userfound");
        } else {
          res.send("usernotfound");
        }
      });
  } catch (error) {
    res.send(error);
  }
});

app.post("/messages", (req, res) => {
  const data = req.body;
  const { name, email, message } = data;
  db.query("insert into messages (username , email , message) values (?,?,?)", [
    name,
    email,
    message,
  ]).then(res.send("message received"));
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../client/public/uploads/posts");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  const owner_name = req.body.title;
  const img_name = req.file.originalname;

  try {
    await db.query(
      "Insert into images (image_name , owner_name) values(? , ?)",
      [img_name, owner_name]
    );
  } catch (error) {
    console.log(error);
  }
});

//get all users

app.get("/getUsers", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.send(result[0]);
  } catch (error) {
    console.log(error);
  }
});

app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await db.query("DELETE FROM users WHERE user_id =?", [id]);
    res.send("user deleted successfully");
  } catch (error) {
    console.log(error);
  }
});

app.get("/allimages", async(req, res) => {
  await db.query("select * from images")
  .then(result=>{
    res.send(result[0])
    
  })
  
});


//get voted status 
app.get("/voted-status/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email)
  try {
    const result = await db.query("SELECT voted from users where email= ?",[email]);
    res.send(result[0]);
  } catch (error) {
    console.log(error);
  }
});

app.put("/voted-status/:email" , (req,res)=>{
  const email  = req.params.email;
  const value = req.body.value;
  try {
    db.query("UPDATE users SET voted =? WHERE email = ?",[value,email]);
    res.send("voted status updated");
  }catch(e){
    console.log(e);
  }
})

//update image votes 
app.put("/vote-image/:id", async(req,res)=>{
  console.log(req.body.message)
  const id = req.params.id;
  const message = req.body.message;
  if(message == "up"){
    db.query("UPDATE images SET votes = votes + 1 WHERE image_id =?",[id]);
    res.send("image upvoted");
  }else if(message == "down"){
    db.query("UPDATE images SET votes = votes - 1 WHERE image_id =?",[id]);
    res.send("image downvoted");
  }
})


//remove image 

app.delete("/images/:image_name" , async(req,res)=>{ 
  const image_name = req.params.image_name;
  try {
    await db.query("DELETE FROM images WHERE image_name =?",[image_name]);
    fs.unlink(`../client/public/uploads/posts/${image_name}` , (err)=>{
      if(err) console.log(`${err} occurs in our system`)
      else res.send("success deletes image")
    })

  }catch(e){
    res.send(e)
  }
})


app.put("/motion" , async(req,res)=>{
  const motion = req.body.motion;
  await db.query("update motion set motion_topic = ?" , [motion])
  .then((result)=>{
    res.send("motion updated successfully")
  })
})

app.get("/getmotion", async(req,res)=>{
  try {
    await db.query("SELECT * FROM motion")
    .then((result)=>res.send(result[0]))
  } catch (error) {
    res.send(error)
  }
})

app.get("/get-allvotes" , async(req,res)=>{
  try {
    await db.query("select sum (votes) as allvotes from images")
    .then((result)=>res.send(result[0]))
  } catch (error) {
    res.send(error)
  }
})

app.get("/topusers" , async(req,res)=>{
  try {
    await db.query("select * from images order by votes desc")
    .then(result=>{
      res.send(result[0])
    })
  }catch(error){
    res.send(error)
  }
})

app.get("/getmessages" , async(req,res)=>{
  await db.query("select * from messages")
  .then(result=>{
    res.send(result[0])
  })
})

app.delete("/message/:id", async(req,res)=>{
  const id = req.params.id;

  try {
    await db.query("DELETE FROM messages WHERE message_id =?",[id]);
    res.send("message deleted successfully");
  } catch (error) {
    console.log(error);
  }
})
app.listen(4000, console.log("server started on port 4000"));
