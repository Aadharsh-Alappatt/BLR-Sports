const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/message", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.post("/save-data", async (req, res) => {
  try {
    const receivedData = req.body.data; // Assuming your data is sent as { data: [...] }
    await fs.writeFile("data1.json", JSON.stringify(receivedData));
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.get("/data1.json", async (req, res) => {
  try {
    // Assuming data1.json is in the same directory as server.js
    const filePath = "./data1.json";

    // Read the content of data1.json and send it as the response
    const data1Content = await fs.readFile(filePath, "utf-8");
    res.json(JSON.parse(data1Content));
  } catch (error) {
    console.error("Error serving data1.json:", error);
    res.status(500).json({ error: "Failed to serve data1.json" });
  }
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});
