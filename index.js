require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
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
    const usersCollection = client.db("ebay").collection("users");
    const blogsCollection = client.db("ebay").collection("blogs");

    // Save User To DB , Generate & Sent JWT Token to site
    app.put("/user/:email", async (req, res) => {
        const { email } = req.params;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
            $set: user,
        };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        const token = jwt.sign(user, process.env.ACC_Token, {
            expiresIn: "1d",
        });
        res.send({ result, token });
    });

    // Get Blogs
    app.get("/blogs", async (req, res) => {
        const curser = blogsCollection.find({});
        const blogs = await curser.toArray();
        res.send(blogs);
    });
};

database().catch((err) => console.log(`${err.name} ${err.message}`));

app.get("/", (req, res) => {
    res.send("Ebay Server Running");
});

app.listen(port, () => {
    console.log("Server Run Okk");
});
