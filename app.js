const express = require("express");
const { google } = require("googleapis");
const app = express();
const path = require("path");
require("dotenv").config();

const PORT = 3000;
// Cấu hình static file và EJS
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Load từ biến môi trường
const GOOGLE_CREDENTIALS = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"), // fix xuống dòng
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  token_uri: "https://oauth2.googleapis.com/token",
};

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

const auth = new google.auth.GoogleAuth({
  credentials: GOOGLE_CREDENTIALS,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

const SHEET_ID = "1_aqWRKvGKQC5BMSCk4dEy7R1LKTH0xZoGbza0Gj18xo";

// Danh sách sheet
const SHEET_NAMES = [
  "Rack",
  "CCTV",
  "PA",
  "ACS",
  "VDP",
  "CarP",
  "UPS Tycon",
  "Switch Tycon",
];
const RANGE = "A1:G200";

app.get("/api/sheet", async (req, res) => {
  try {
    const ranges = SHEET_NAMES.map((name) => `${name}!${RANGE}`);
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SHEET_ID,
      ranges: ranges,
    });

    const result = {};
    response.data.valueRanges.forEach((range, index) => {
      const sheetName = SHEET_NAMES[index];
      result[sheetName] = range.values || [];
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data from Google Sheets");
  }
});

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
