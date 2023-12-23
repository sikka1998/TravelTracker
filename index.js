import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  password: "postgres123",
  host: "localhost",
  database: "world",
  port: "5432"
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function is_visited() {
  let result = [];
  const countries = await db.query("SELECT country_code from visited_countries");
  countries.rows.forEach(country => {
    result.push(country.country_code);
  });
  return result;
};

app.get("/", async (req, res) => {
  //Write your code here.
  let visited_countries = await is_visited();
  console.log(visited_countries);
  res.render("index.ejs", {total: visited_countries.length, countries: visited_countries});
});

app.post("/add", async (req, res) => {
  let country_code = null;
  // let result = null;
  console.log(req.body.country);
  let country = req.body.country;
  try {
    let result = await db.query("SELECT country_code from countries where LOWER(country_name) LIKE '%' || $1 || '%'", [country.toLowerCase()]);
    console.log(result.rows);
    result.rows.forEach(code => {
    country_code = code.country_code;
  });
  console.log(country_code);
  if(country_code === null){
    throw new Error("Query returned Null");
  }
    try {
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [country_code]);
      res.redirect("/");
    } catch (err) {
      console.log(err);
      let visited_countries = await is_visited();
      res.render("index.ejs", {total: visited_countries.length,countries: visited_countries, error: "Country has been already added!"} );
    }
  }catch (err) {
    console.log(err);
    let visited_countries = await is_visited();
    res.render("index.ejs", {total: visited_countries.length,countries: visited_countries, error: "Country does not exists!"} );
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
