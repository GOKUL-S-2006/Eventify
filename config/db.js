const mongoose=require('mongoose');
exports.connectDB=async ()=>{
    try{
      const conn=await mongoose.connect(process.env.MONGO_URL);
      console.log("DB connction successfull!!");
    }catch(err){
        console.error("Connection Error",err.message);
         process.exit(1);
    }
}