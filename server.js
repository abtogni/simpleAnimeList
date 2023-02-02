const express = require("express");
const mariadb = require("mariadb");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");

const app = express();
const db = mariadb.createPool({
  host: "localhost",
  user: "admin",
  password: "password",
  database: "mariadb",
  connectionLimit: 5,
});
const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(
  session({ secret: "keyboard cat", resave: false, saveUninitialized: true })
);
app.use("/public", express.static(path.join(__dirname + "/public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

app.get("/", async (req, res, next) => {
  try {
    const conn = await db.getConnection();
    console.log("Connected to database.");
    const sql = "SELECT * FROM animeList";
    const rows = await conn.query(sql);
    res.render("index", { data: rows });
  } catch (error) {
    console.log(error);
    req.flash("error", error);
    res.render("index");
  }
});

app.post("/addtoList", async (req, res) => {
  try {
    const conn = await db.getConnection();
    console.log("Connected to the database.");
    const sql = `
      INSERT INTO animeList (title, engTitle, seasons, eps, status, dateStarted, dateFinished) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      req.body.title,
      req.body.engTitle,
      req.body.seasons,
      req.body.eps,
      req.body.status,
      req.body.dateStarted,
      req.body.dateFinished,
    ];
    await conn.query(sql, params);
  } catch (error) {
    console.log(error);
  }
  res.redirect("/");
});

app.listen(port, (err) => {
  if (err) console.log("Error setting up server");
  console.log(`Server loaded at http://127.0.0.1:${port}`);
});