const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = 5555
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');

app.get('/', (req, res) => {
    res.send('hireloop server working')
})


const uri = process.env.MONGODB_URI

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
        await client.connect();

        const db = client.db('hireloop_db');
        const jobCollection = db.collection('jobs')
        const companyCollection = db.collection('companies')

        // jobs related apis
        // get company jobs
        app.get('/api/jobs', async (req, res) => {
            const query = {};
            if (req.query.companyId) query.companyId = req.query.companyId;
            if (req.query.status) query.status = req.query.status;
            const cursor = jobCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // post a job
        app.post('/api/jobs', async (req, res) => {
            const job = req.body
            const result = await jobCollection.insertOne(job) 
            res.send(result)
        })

        // company related apis
        // create a company
        app.post('/api/companies', async (req, res) => {
            const company = req.body;
            const result = await companyCollection.insertOne(company)
            res.send(result);
        })

        // get recruiter company
        app.get('/api/my/companies', async (req, res) => {
            const query = {};
            if (req.query.recruiterId) {
                query.recruiterId = req.query.recruiterId
            }
            const result = await companyCollection.findOne(query);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`HireLoop server running on port ${port}`)
})