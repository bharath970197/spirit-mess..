const express = require("express");
const session = require("express-session");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 10000;
const ROOT = __dirname;
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(session({
  name: "mess.sid",
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 8 * 60 * 60 * 1000 }
}));

const studentOnly = (req, res, next) => req.session.user?.role === "student"
  ? next() : res.status(401).json({ success: false, message: "Please log in as a student." });
const adminOnly = (req, res, next) => req.session.user?.role === "admin"
  ? next() : res.status(403).json({ success: false, message: "Admin access only." });

app.get("/api/me", (req, res) => res.json({ success: true, user: req.session.user || null }));
app.post("/api/register", (req, res) => {
  try { res.json(db.registerUser(req.body || {})); }
  catch (e) { console.error(e); res.status(500).json({ success:false, message:"Registration failed." }); }
});
app.post("/api/login", (req, res) => {
  try {
    const { username, password } = req.body || {};
    let result = db.authenticateUser(username, password);
    if (result.success) req.session.user = result.user;
    else {
      const admin = db.authenticateAdmin(username, password);
      if (admin.success) {
        result = { success:true, message:"Admin login successful!", user:{ username:admin.admin.username, name:"Administrator", role:"admin" } };
        req.session.user = result.user;
      }
    }
    res.json(result);
  } catch (e) { console.error(e); res.status(500).json({success:false,message:"Login failed."}); }
});
app.post("/api/logout", (req, res) => req.session.destroy(() => res.json({success:true})));

app.get("/api/menu", (req,res) => {
  const data = db.loadDatabase();
  res.json({success:true, menu:Array.isArray(data.menu)?data.menu:[]});
});
app.post("/api/menu", adminOnly, (req,res) => {
  const d = req.body || {};
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const meals = ["Breakfast","Snacks","Lunch","Dinner"];
  if (!days.includes(d.day) || !meals.includes(d.meal) || !String(d.food||"").trim())
    return res.status(400).json({success:false,message:"Enter valid day, meal and food."});
  const data = db.loadDatabase();
  if (!Array.isArray(data.menu)) data.menu = [];
  const item = { id:d.id ? String(d.id) : crypto.randomUUID(), day:d.day, meal:d.meal, food:String(d.food).trim(), hostel:d.hostel||"All" };
  if (d.id) {
    const i = data.menu.findIndex(x=>String(x.id)===String(d.id));
    if (i < 0) return res.status(404).json({success:false,message:"Menu item not found."});
    data.menu[i] = {...data.menu[i],...item};
  } else data.menu.push(item);
  db.saveDatabase(data);
  res.json({success:true,item,message:d.id?"Menu item updated.":"Menu item added."});
});
app.delete("/api/menu/:id", adminOnly, (req,res) => {
  const data = db.loadDatabase();
  const old = data.menu.length;
  data.menu = data.menu.filter(x=>String(x.id)!==String(req.params.id));
  if (old===data.menu.length) return res.status(404).json({success:false,message:"Menu item not found."});
  db.saveDatabase(data); res.json({success:true});
});

app.get("/api/admin/summary", adminOnly, (req,res) => {
  const students = (db.loadDatabase().users||[]).filter(u=>(u.role||"student")==="student");
  const hostels = ["Sophia","Cicily","Joseph","Alphonsa"];
  const hostelCounts = Object.fromEntries(hostels.map(h=>[h,students.filter(s=>s.hostel===h).length]));
  res.json({success:true,total:students.length,vegetarian:students.filter(s=>s.foodPreference==="Vegetarian").length,nonVegetarian:students.filter(s=>s.foodPreference==="Non-Vegetarian").length,hostelCounts,students:students.map(({name,username,hostel,foodPreference})=>({name,username,hostel,foodPreference}))});
});
app.get("/api/admin/feedback", adminOnly, (req,res)=>res.json({success:true,feedback:db.getAllFeedback()}));
app.post("/api/feedback", studentOnly, (req,res)=>{
  try { res.json(db.submitFeedback({...req.body,username:req.session.user.username})); }
  catch(e) { console.error(e); res.status(500).json({success:false,message:"Unable to submit feedback."}); }
});
app.post("/api/away", studentOnly, (req,res)=>{
  try { res.json(db.createAwayRequest(req.session.user.username,req.body)); }
  catch(e) { res.status(500).json({success:false,message:e.message}); }
});
app.get("/api/away/mine", studentOnly, (req,res)=>res.json({success:true,requests:db.getStudentAwayRequests(req.session.user.username)}));
app.get("/api/admin/away", adminOnly, (req,res)=>res.json({success:true,requests:db.getAllAwayRequests()}));
app.post("/api/admin/away/status", adminOnly, (req,res)=>{
  const {id,status}=req.body||{};
  res.json(db.updateAwayRequestStatus(id,status));
});
app.get("/api/admin/meal-report", adminOnly, (req,res)=>res.json(db.getMealReport(req.query.date)));

app.get("/", (req,res)=>res.redirect("/login.html"));
app.get("/*.html", (req,res,next)=>{
  const page = path.basename(req.path);
  const file = path.join(ROOT,"src",page);
  fs.readFile(file,"utf8",(err,html)=>{
    if(err) return next(err);
    if(page==="feedback.html") html=html.replace(/<script[^>]*src=["']js\/feedback\.js["'][^>]*><\/script>/i,"");
    const scripts = page==="feedback.html"
      ? '<script src="/js/web-adapter.js"></script><script src="/js/feedback-web.js"></script>'
      : '<script src="/js/web-adapter.js"></script>';
    html=html.replace("</body>",scripts+"</body>");
    res.type("html").send(html);
  });
});
app.use(express.static(path.join(ROOT,"src")));
app.get("*",(req,res)=>res.status(404).send("Page not found"));

app.listen(PORT,"0.0.0.0",()=>console.log("Campus Mess Management web server listening on "+PORT));
