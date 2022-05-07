const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());


// Verify token
function verifyToken(token) {
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {

        if (err) {
            email = 'Invalid Email'
        }
        if (decoded) {
            email = decoded;
        }

    });
    return email;
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.48f58.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const orderCollection = client.db("serviceProduct").collection("order");


        //  JWT for login
        app.post('/login', async (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
            res.send({ token })
        })


        // Services API
        // post order 
        app.post('/order', async (req, res) => {
            const newOrder = req.body;
            const orders = await orderCollection.insertOne(newOrder);
            res.send(orders);
        });


        // Read all product 
        app.get('/order', async (req, res) => {
            const query = {};
            const cursor = orderCollection.find(query);
            const myItems = await cursor.toArray();
            res.send(myItems);
        });

        // Read single product
        app.get('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const update = await orderCollection.findOne(query);
            res.send(update);
        });

        // Read all product of single user in my items route
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = orderCollection.find(query);
            const myItems = await cursor.toArray();
            res.send(myItems);
        });


        // Update quantity for add with previous quantity
        app.put('/order/:id', async (req, res) => {
            const id = req.params.id;
            const user = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    // quantity: user.addQuantity,
                    quantity: (user.setQuantity),
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });


        // Update quantity reduce from quantity by deliver
        // app.put('/order/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const data = req.body;
        //     const filter = { _id: ObjectId(id) };
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: {
        //             quantity: data.addQuantity
        //         },
        //     };
        //     const result = await orderCollection.updateOne(filter, updateDoc, options);
        //     res.send(result);
        // })


        // Delete single product
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        });

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