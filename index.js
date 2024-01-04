const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Coffee Server is running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9u7odmy.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();

        const coffeeCollection = client.db('coffeeStoreDB').collection('coffee')
        const userCollection = client.db('coffeeStoreDB').collection('user')

        app.get('/coffees', async (req, res) => {
            const cursor = coffeeCollection.find()
            const result = await cursor.toArray()
            res.send(result);
        })

        app.post('/coffees', async (req, res) => {
            const coffees = req.body;
            // console.log(coffees);
            const result = await coffeeCollection.insertOne(coffees)
            res.send(result)
        })

        app.delete('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('ami ID dorc vai:' , id);
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.deleteOne(query)
            res.send(result)
        })

        // single data update data
        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const coffee = await coffeeCollection.findOne(query)
            res.send(coffee)
        })

        // update data
        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const coffee = req.body;
            // console.log(id, coffee);
            const filter = { _id: new ObjectId(id) }
            const option = { upsert: true }
            const updateCoffee = {
                $set: {
                    name: coffee.name,
                    quantity: coffee.quantity,
                    supplier: coffee.supplier,
                    taste: coffee.taste,
                    category: coffee.category,
                    details: coffee.details,
                    price: coffee.price,
                    photo: coffee.photo,
                }
            }

            const result = await coffeeCollection.updateOne(filter, updateCoffee, option)
            res.send(result)
        });


        // user related api
        app.get('/user', async (req, res) => {
            const cursor = userCollection.find();
            const user = await cursor.toArray()
            res.send(user)
        })

        app.post('/user', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
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



app.listen(port, () => {
    console.log(`Coffee Server is running on PORT: ${port}`);
})