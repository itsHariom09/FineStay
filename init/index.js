const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing = require("../models/listing.js");

main().then(()=>{console.log("DB connected")})
.catch(err=>console.log(err));

let urll=process.env.ATLISTDB_URL;
async function main() {
    await mongoose.connect(urll);
    await mongoose.connect(process.env.ATLISTDB_URL);
}

const initDB = async () => {
   await Listing.deleteMany({});
   initData.data=initData.data.map((obj)=>({
    ...obj,
    owner:"67a7770d79c8dc7b9eee9698",
   }));
   await Listing.insertMany(initData.data);
};

initDB();