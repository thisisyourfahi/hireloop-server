const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = 5555
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
        const usersCollection = db.collection('user');
        const applicationCollection = db.collection('applications');

        // application related apis
        // pos an application
        app.post('/api/applications', async (req, res) => {
            const application = req.body
            const newApplication = {
                ...application,
                createdAt: new Date()
            }
            const result = await applicationCollection.insertOne(newApplication)
            res.send(result);
        })

        // user related apis
        // get all users 
        app.get('/api/users', async (req, res) => {
            const cursor = usersCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        // jobs related apis
        // get a job by id
        app.get('/api/jobs/:id', async (req, res) => {
            const id = req.params.id
            const result = await jobCollection.findOne({_id: new ObjectId(id)})
            res.send(result)
        })

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
            const newJob = {
                ...job,
                createdAt: new Date()
            }
            const result = await jobCollection.insertOne(newJob) 
            res.send(result)
        })

        // company related apis
        // get companies 
        app.get('/api/companies', async (req, res) => {
            const cursor = companyCollection.find()
            const result = await cursor.toArray()
            res.send(result);
        })

        // create a company
        app.post('/api/companies', async (req, res) => {
            const company = req.body;
            const newCompany = {
                ...company,
                createdAt: new Date()
            }
            const result = await companyCollection.insertOne(newCompany)
            res.send(result);
        })

        // get recruiter company
        app.get('/api/my/companies', async (req, res) => {
            const query = {};
            if (req.query.recruiterId) {
                query.recruiterId = req.query.recruiterId
            }
            const result = await companyCollection.findOne(query);
            res.send(result || {});
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