import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.static("public"));

app.get("/api/search", async (req, res) => {
  const { query, page, order_by } = req.query;
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=12&order_by=${order_by}&client_id=${process.env.UNSPLASH_KEY}`;
  try {
    const data = await fetch(url).then(r => r.json());
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});

app.listen(3000, () => console.log("Running on http://localhost:3000"));