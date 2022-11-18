require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

// Middle Wire
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster.qheqolp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const database = async () => {
    const test = client.db("text").collection("test");
    await test.insertOne({ name: "Pahlovi" });
};

database().catch((err) => console.log(`${err.name} ${err.message}`));

app.get("/", (req, res) => {
    res.send("assignment-12 Server Running");
});

app.listen(port, () => {
    console.log("Server Run Okk");
});
