const express = require("express");
const mongoose = require("mongoose");
const authRouter = require('./authRouter')


const PORT = process.env.PORT || 5000;
const url = 'mongodb+srv://pavelkv94:157842@clusterfortgbot.hi5sp.mongodb.net/Auth?retryWrites=true&w=majority';

const app = express();

app.use(express.json()); 
app.use("/auth", authRouter)

const start = async () => {
  try {
      await mongoose.connect(url)
    app.listen(PORT, () => console.log(`server started on port ${PORT}`));
  } catch (e) {
      console.log(e)
  }
};

start();