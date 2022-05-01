const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.48f58.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("serviceProduct").collection("product");

        // Real all Product
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // Read single product
        app.get('/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const update = await productCollection.findOne(query);
            res.send(update);
        })

        // Post or Create single product
        app.post('/product', async (req, res) => {
            const newItem = req.body;
            const result = await productCollection.insertOne(newItem);
            res.send(result);
        });

        // Delete single product
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('md borhan uddin majumder');
})

app.listen(port, () => {
    console.log('Listening to port', port);
})