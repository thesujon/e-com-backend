const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const mongoose = require('mongoose');

global.__basedir = __dirname;


//mongoose.connect('mongodb://localhost:27017/bohubrihi-ecommerce')
const DB = process.env.MONGODB_URL_SERVER.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
})

    .then(() => console.log("Connected to MongoDB!"))
    .catch(err => console.error("MongoDB Connection Failed!"));

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`App running on port ${port}!`);
})