const express = require('express')
const { MongoClient } = require('mongodb');
var cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;

//handleDynamic
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

//Midleware

app.use(cors());
// Send Json data
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9z7i3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("Services");
        const serviceCollection = database.collection("name");
        const userCollection = database.collection("user");
        const ratingCollection = database.collection("rating");
        const AdminAndUserCollection = database.collection("AdminAndUser");

        //DATA

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.json(result);
        });

        app.get('/services', async (req, res) => {
            const cursors = serviceCollection.find({})
            const result = await cursors.toArray()
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            res.send(result);
        })

        // User Collection

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await AdminAndUserCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await AdminAndUserCollection.insertOne(user);
            res.json(result);
        })

        app.put('/user', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await AdminAndUserCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })

        app.put('/user/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } };
            const result = await AdminAndUserCollection.updateOne(filter, updateDoc);
            res.send(result)
        });

        //USers Order

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user)
            res.json(result);
        });

        app.get('/users', async (req, res) => {
            const cursors = userCollection.find({})
            const result = await cursors.toArray()
            res.send(result)
        })
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await userCollection.findOne(query)
            res.send(result);
        })
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result);
        });

        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedUser.name,
                    note: updatedUser.note
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        //Rating

        app.post('/rating', async (req, res) => {
            const rating = req.body;
            const result = await ratingCollection.insertOne(rating)
            res.json(result);
        })

        app.get('/rating', async (req, res) => {
            const cursor = ratingCollection.find({})
            const result = await cursor.toArray()
            res.send(result);
        })


        app.listen(port, () => {
            console.log('run with', port)
        });


    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);