import express from 'express'
import path from 'path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient, ServerApiVersion, ObjectId} from 'mongodb';

const app = express(); 
const __dirname = dirname(fileURLToPath(import.meta.url));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const uri = "mongodb+srv://joe:joe@cluster0.5abxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

const mongoCollection = client.db("barrys-db").collection("parking-collection"); 
   
// Load in Mongo data
async function initParkingData() {
    try {
    await mongoCollection.insertMany([
        {
        _id: new ObjectId(),
        date: new Date("2025-01-30T09:33:00Z"), // ISODate format
        time: "9:33",
        note: "made the loop, parked down street, on street across from golf house, 9:44 in the bldg. They got a whole row blocked off for new const. parking lot but now worky being done...we'll see if they did anything on my walk back",
        },
        {
        _id: new ObjectId(),
        date: new Date("2025-01-28T10:23:00Z"), // ISODate format
        time: "10:23",
        note: "Well thank my lucky stars. Ran later today but a gift of the last spot, 4th from right on back wall!",
        },
        {
        _id: new ObjectId(),
        date: new Date("2025-01-23T09:47:00Z"), // ISODate format
        time: "9:47",
        note: "by the mailboxes o'er in those first block of apartments. Am I in mailman's way? No signs. Maybe like 9:44 when made the loop, didn't write down.",
        },
        {
        _id: new ObjectId(),
        date: new Date("2025-01-21T09:41:00Z"), // ISODate format
        time: "9:41",
        note: "hallelujah! Got the last one. Third or so from right facing Wesleyan.",
        },
        {
        _id: new ObjectId(),
        date: new Date("2025-01-16T10:49:00Z"), // ISODate format
        time: "10:49",
        note: "in that spot right by Student Publication building",
        },
        {
        _id: new ObjectId(),
        date: new Date("2025-01-14T10:01:00Z"), // ISODate format
        time: "10:01",
        note: "Made the loop at 10:01, parked at Nobles, in office ~10:12. Clear, sunny, chilly day. Spot opened up by time I walked by it.",
        },
    ]);
    console.log("Parking data initialized successfully.");
    } catch (error) {
    console.error("Error initializing parking data:", error);
    }
}

// initParkingData().catch(console.dir);

//mongoCollection.deleteMany({}) // Uncomment this line to delete all documents in the collection


async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    console.log('in get'); 
    try {
      res.render('index', {pageTitle: 'parking app'}); // Render the index.ejs file
    } catch (error) {
      console.error("Error rendering index.ejs:", error);
      res.status(500).send("Internal Server Error");
    }
  });

app.get('/data/parkingData', async (req, res) => {
  try {
    // Fetch all documents from the collection
    const parkingData = await mongoCollection.find({}).toArray();
    res.json(parkingData); // Send the data as JSON
  } catch (error) {
    console.error("Error fetching parking data:", error);
    res.status(500).send("Internal Server Error");
  }
});

const server = app.listen(process.env.PORT || 3000, function() {
    const host = server.address().address;
    const port = server.address().port;
  
    console.log("Server is running on http://%s:%s", host, port);
  });