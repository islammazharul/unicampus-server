require('dotenv').config()
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(
    cors({
        origin: "*",
        methods: "GET,POST,PATCH,PUT,DELETE",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
    })
);
app.use(express.json());



const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.h8hwzy8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // college info apis
        const collegesCollection = client.db("collegesDB").collection("colleges");
        const usersCollection = client.db("collegesDB").collection("users");
        const admissionCollection = client.db("collegesDB").collection("admission");

        app.get("/colleges", async (req, res) => {
            const result = await collegesCollection.find().toArray()
            res.send(result)
        })
        app.get("/collegesTop", async (req, res) => {
            const result = await collegesCollection.find().limit(3).toArray()
            res.send(result)
        })

        // user related apis
        app.get("/users", async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        app.post("/users", async (req, res) => {
            const user = req.body;
            console.log("user", user);
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: "User already exist" })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        app.get("/admission", async (req, res) => {
            const result = await admissionCollection.find().toArray();
            res.send(result)
        })

        app.get("/admission/:email", async (req, res) => {
            const email = req.params?.email;
            const result = await admissionCollection.find({ email }).toArray()
            res.send(result)
        })

        app.post("/admission", async (req, res) => {
            const admission = req.body;
            const result = await admissionCollection.insertOne(admission);
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("unicampus is running")
})
app.listen(port, () => {
    console.log(`unicampus running on port ${port}`);
})