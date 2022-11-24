require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

// Middle Wire
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster.qheqolp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized Access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACC_Token, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbidden Access" });
        }
        req.decoded = decoded;
        next();
    });
}

const database = async () => {
    const userCollection = client.db("ebay").collection("users");
    const blogCollection = client.db("ebay").collection("blogs");
    const productCollection = client.db("ebay").collection("products");

    // Verify Admin
    const verifyAdmin = async (req, res, next) => {
        const decodedEmail = req.decoded.email;
        const query = { email: decodedEmail };
        const user = await userCollection.findOne(query);
        if (user?.role !== "admin") {
            return res.status(403).send({ message: "Forbidden Access" });
        }
        next();
    };

    // Save User To DB , Generate & Sent JWT Token to site
    app.put("/user/:email", async (req, res) => {
        const { email } = req.params;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
            $set: user,
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        const token = jwt.sign(user, process.env.ACC_Token, {
            expiresIn: "1d",
        });
        res.send({ result, token });
    });

    // Get All Buyer For Admin
    app.get("/users/allbuyer", verifyJWT, verifyAdmin, async (req, res) => {
        const query = { role: "buyer" };
        const cursor = userCollection.find(query);
        const buyers = await cursor.toArray();
        res.send(buyers);
    });

    // Get All Seller For Admin
    app.get("/users/allseller", verifyJWT, verifyAdmin, async (req, res) => {
        const query = { role: "seller" };
        const cursor = userCollection.find(query);
        const sellers = await cursor.toArray();
        res.send(sellers);
    });

    // Get The User Bu Email
    app.get("/user/:email", verifyJWT, async (req, res) => {
        const { email } = req.params;
        const decodedEmail = req.decoded.email;

        if (email !== decodedEmail) {
            return res.status(403).send({ message: "Forbidden Access" });
        }
        const query = { email: email };
        const user = await userCollection.findOne(query);
        res.send(user);
    });

    // Delete review
    app.delete("/user/:email", async (req, res) => {
        const { email } = req.params;
        const query = { email: email };
        const result = await userCollection.deleteOne(query);
        if (result.deletedCount) {
            res.send({
                success: true,
                message: "Successfully Deleted",
            });
        }
    });

    // Get Blogs
    app.get("/blogs", async (req, res) => {
        const curser = blogCollection.find({});
        const blogs = await curser.toArray();
        res.send(blogs);
    });

    app.get("/categories", async (req, res) => {
        const curser = productCollection.find({});
        const products = await curser.toArray();
        const allCategories = products.map((product) => product.category);
        const categories = allCategories.filter((v, i, a) => a.indexOf(v) === i);
        res.send(categories);
    });
};

database().catch((err) => console.log(`${err.name} ${err.message}`));

app.get("/", (req, res) => {
    res.send("Ebay Server Running");
});

app.listen(port, () => {
    console.log("Server Run Okk");
});
