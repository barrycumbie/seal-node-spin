import dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import path from 'path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Ensure 'views' directory exists
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// MongoDB connection
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const mongoCollection = client.db("barrys-db").collection("parking-collection");

// Initialize parking data
async function initParkingData() {
  try {
    await mongoCollection.insertMany([
      {
        _id: new ObjectId(),
        date: new Date("2025-01-30T09:33:00Z"),
        time: "9:33",
        note: "made the loop, parked down street, on street across from golf house, 9:44 in the bldg. They got a whole row blocked off for new const. parking lot but now worky being done...we'll see if they did anything on my walk back",
      },
      {
        _id: new ObjectId(),
        date: new Date("2025-01-28T10:23:00Z"),
        time: "10:23",
        note: "Well thank my lucky stars. Ran later today but a gift of the last spot, 4th from right on back wall!",
      },
      {
        _id: new ObjectId(),
        date: new Date("2025-01-23T09:47:00Z"),
        time: "9:47",
        note: "by the mailboxes o'er in those first block of apartments. Am I in mailman's way? No signs. Maybe like 9:44 when made the loop, didn't write down.",
      },
      {
        _id: new ObjectId(),
        date: new Date("2025-01-21T09:41:00Z"),
        time: "9:41",
        note: "hallelujah! Got the last one. Third or so from right facing Wesleyan.",
      },
      {
        _id: new ObjectId(),
        date: new Date("2025-01-16T10:49:00Z"),
        time: "10:49",
        note: "in that spot right by Student Publication building",
      },
      {
        _id: new ObjectId(),
        date: new Date("2025-01-14T10:01:00Z"),
        time: "10:01",
        note: "Made the loop at 10:01, parked at Nobles, in office ~10:12. Clear, sunny, chilly day. Spot opened up by time I walked by it.",
      },
    ]);
    console.log("Parking data initialized successfully.");
  } catch (error) {
    console.error("Error initializing parking data:", error);
  }
}

// Uncomment the following line to initialize parking data
initParkingData().catch(console.dir);

// mongoCollection.deleteMany({})


// MongoDB connection test
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
//run().catch(console.dir);

// Route to render index.ejs
app.get('/', (req, res) => {
  try {
    res.render('index', { pageTitle: "myapp" }); // Pass pageTitle to the view
  } catch (error) {
    console.error("Error rendering index.ejs:", error);
    res.status(500).send("Internal Server Error");
  }
});

// API endpoint to fetch parking data
app.get('/data/parkingData', async (req, res) => {
  try {
    const parkingData = await mongoCollection.find({}).toArray();
    res.json(parkingData); // Send the data as JSON
  } catch (error) {
    console.error("Error fetching parking data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// POST endpoint to save parking data
app.post('/saveParkingData', async (req, res) => {
  try {
    // Extract data from the form submission
    const { whereParked } = req.body;

    // Create a new parking data object
    const newParkingData = {
      _id: new ObjectId(), // Generate a unique ID
      date: new Date(), // Automatically set the current date and time
      note: whereParked, // Use the data from the form
    };

    // Insert the new parking data into the MongoDB collection
    await mongoCollection.insertOne(newParkingData);
    console.log("New parking data saved:", newParkingData);

    // Fetch the updated parking data from the collection
    // const updatedParkingData = await mongoCollection.find({}).toArray();

    // Send the updated data as a JSON response
    // res.json(updatedParkingData);
    res.redirect('/'); // Redirect to the index page after saving
  } catch (error) {
    console.error("Error saving parking data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// PUT endpoint to update parking data
app.put('/updateParkingData/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID from the URL
    const { note } = req.body; // Extract the updated note from the request body

    // Update the parking data in the MongoDB collection
    const result = await mongoCollection.updateOne(
      { _id: new ObjectId(id) }, // Match the document by ID
      { $set: { note, date: new Date() } } // Update the note and set the current date
    );

    if (result.matchedCount === 0) {
      return res.status(404).send("Parking data not found");
    }

    console.log(`Parking data with ID ${id} updated successfully.`);
    res.json({ message: "Parking data updated successfully" });
  } catch (error) {
    console.error("Error updating parking data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// DELETE endpoint to delete parking data
app.delete('/deleteParkingData/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID from the URL

    // Delete the parking data from the MongoDB collection
    const result = await mongoCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send("Parking data not found");
    }

    console.log(`Parking data with ID ${id} deleted successfully.`);
    res.json({ message: "Parking data deleted successfully" });
  } catch (error) {
    console.error("Error deleting parking data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
const server = app.listen(process.env.PORT || 3000, () => {
  const port = server.address().port;
  console.log(`Server is running on http://localhost:${port}`);
});