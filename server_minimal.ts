import express from "express";
const app = express();
const port = 5000;

console.log("Attempting to start minimal server...");

app.get("/", (req, res) => {
    res.send("Hello from Minimal Server!");
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Minimal server listening on port ${port}`);
});
