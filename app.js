const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const path=require('path');
const nodemailer = require('nodemailer');
const generateUniqueId = require('generate-unique-id');

const id2 = generateUniqueId({
  length: 32,
  useLetters: false
});



const app = express();
require('dotenv').config()
const cors = require("cors")
const stripe = require('stripe')(process.env.SKEY); // Replace 'your_secret_key' with your actual Stripe secret key
const bodyParser = require('body-parser');
const upload = require('./multer');
const { type } = require('os');
app.use(bodyParser.json());
app.use(cors());

app.use("/",express.static(path.join(__dirname,'uploads')));


mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected!'));


const teamSchema = new mongoose.Schema({
  referrer:{type:String,required: true},
  referred:{type:String,required: true},
  status:{type:Number,required: true}
})


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  userid: { type: String },
  useref: { type: String },
  phonenumber: { type: String, required: true },
  img: { type: String },
  picture: { type: String },
  createuserid:{type: String}
});

const User = mongoose.model("User", userSchema);
teamSchema.index({ referrer: 1 }, { unique: false });
const Team = mongoose.model("Team", teamSchema);


app.get("/get/all/teams", async (req, res) => {
  try {
    const { createuserid } = req.query;

    // Assuming Team and User models are properly imported
    const teams = await Team.find({ referrer: createuserid });
    const myteams = await Team.find({ referred: createuserid });

    // Map through teams to fetch user data for each referrer
    const userPromises = teams.map(async (team) => {
      const userData = await User.findOne({ createuserid: team.referrer });
      return userData; // Return the user data
    });
    const userPromises2 = myteams.map(async (team) => {
      const userData = await User.findOne({ createuserid: team.referrer });
      return userData; // Return the user data
    });

    // Wait for all user data promises to resolve
    const usersData = await Promise.all(userPromises);
    const usersData2 = await Promise.all(userPromises2);

    // Respond with both teams and usersData
    res.send({ data: teams, users: usersData,myuser:usersData2 });

  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error'); // Handle error appropriately
  }
});

app.post("/team/join/user", async (req, res) => {
  try {
    const data = req.body;
    const { referrer, referred, status } = data;
    const user = await Team.create({ referrer, referred, status });
    res.send({ status: "1", message: "user created successfully" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send({ status: "0", error: "Duplicate key error" });
    } else {
      console.log(error);
      res.status(500).send({ status: "0", error: "Internal server error" });
    }
  }
})


app.delete("/user/delete/all",async(req,res)=>{
  try {
    await User.deleteMany({});
    res.send({status:"1",message:"all user deleted"})
  } catch (error) {
    console.log(error);
    res.send({status:"01",error:error.message})
  }
})


app.get("/get/all/team",async(req,res)=>{
  try {
    const { email } = req.query;
    const users = await User.find({useref:email});
    res.send({data:users})
  } catch (error) {
    console.log(error);
  }
})


app.get("/user/image",async(req,res)=>{
  try {
    const { email } = req.query;
    const users = await User.find({email:email});
    res.send({data:users})
  } catch (error) {
    console.log(error);
    res.send({status:"01",error:error.message})
  }
})


app.post("/user/team",async (req, res) => {
  try {
    const {email,usermail,link} = req.body;
  
    const user = await User.findOne({email:usermail});
    const exist = await User.findOne({email:email});


    
    // console.log(exist,"jj");
    console.log(link+'/sign/up?email='+user.email+"&userid="+user.userid);



    const transporter = nodemailer.createTransport({
      // configure your email sending service
      service: 'gmail',
      secure: true,
      port: 465,
      auth: {
          user: 'softcode2005@gmail.com',
          pass: 'jpvn itvc qyso tebu',
      },
  });
  if (!exist) {
    mailOptions = {
     from: 'softcode2005@gmail.com',
     to: email,
     subject: 'Jurist Ai Team',
     html: '<b>Jurist Ai</b><br><a href="https://juristai.wrmlabs.com/sign/up?email='+user.email+'&userid='+user.userid+'&refsub='+user.createuserid+'">Click here for signup</a>'
     
   };
 }else{
    mailOptions = {
     from: 'MS_ChnH3V@trial-x2p0347o789gzdrn.mlsender.net',
     to: email,
     subject: 'Jurist Ai Team',
     html: '<b>Jurist Ai</b><br><a href="https://juristai.wrmlabs.com/login?email='+user.email+'&userid='+user.userid+'&refsub='+user.createuserid+'">Click here for signup</a>'
     
   };
 }
  // await transporter.sendMail(mailOptions);


    // const transporter = nodemailer.createTransport({
    //   pool: true,
    //   host: "smtp.mailersend.net",
    //   port: 587,
    //   // secure: true,
    //   auth: {
    //     user: 'MS_ChnH3V@trial-x2p0347o789gzdrn.mlsender.net',
    //     pass: 'fegPhXgjR8ponHuk'
    //   }
    // });

    // let mailOptions;

    // if (!exist) {
    //    mailOptions = {
    //     from: 'MS_ChnH3V@trial-x2p0347o789gzdrn.mlsender.net',
    //     to: email,
    //     subject: 'Jurist Ai Team',
    //     html: '<b>Jurist Ai</b><br><a href="https://juristai.wrmlabs.com/sign/up?email='+user.email+'&userid='+user.userid+'">Click here for signup</a>'
        
    //   };
    // }else{
    //    mailOptions = {
    //     from: 'MS_ChnH3V@trial-x2p0347o789gzdrn.mlsender.net',
    //     to: email,
    //     subject: 'Jurist Ai Team',
    //     html: '<b>Jurist Ai</b><br><a href="https://juristai.wrmlabs.com/login?email='+user.email+'&userid='+user.userid+'">Click here for signup</a>'
        
    //   };
    // }

      

      // Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error sending email: ' + error);
  } else {
    console.log('Email sent: ' + info.response);
  }


  res.send({status:"1",message:"user link send successfully",email})
});
  } catch (error) {
    console.log(error);
    res.send({status:"01",error:error.message})
  }


   
});


app.post("/user/create",upload.single('img'),async(req,res)=>{
  try {
    const userData = req.body;
    console.log(userData);

    const protocol = req.protocol; // "http" or "https"
        const host = req.get('host'); // Hostname and port
        const baseUrl = `http://${host}`;

        // const userDatasave = new User();

        const userDatasave = new User({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          userid: id2+userData.email,
          useref: userData.useref,
          userefid:userData.userefid,
          phonenumber: userData.phonenumber,
          createuserid:userData.createuserid,
          picture:userData.picture,
          img: baseUrl + "/" + req.file.filename
        });
        


    const data = await User.create(userDatasave);
    // Respond with with full message
    res.send({ data: data,img:baseUrl+"/"+req.file.filename  });
   
    
  } catch (error) {
    console.log(error);
    res.send({status:"01",error:error.message})
  }
})

app.get("/",async(req, res)=>{
try {
  res.send("hello world ! !")
} catch (error) {
  console.log('====================================');
  console.log(error);
  console.log('====================================');
}
})


app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // amount in cents
      currency: 'usd',
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/user/token", async (req, res) => {
  try {

    let data = JSON.stringify({
      "loginId": "aibnsamin",
      "password": "AtticusDev1234@"
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://pacer.login.uscourts.gov/services/cso-auth',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: data
    };

    axios.request(config)
      .then((response) => {
        res.send(response.data)
      })
      .catch((error) => {
        console.log(error);
      });

  } catch (error) {
    console.log(error);
  }
})


app.get("/user/search",async(req, res)=>{
 try {
  const { id, token } = req.query;
  // console.log('====================================');
  // console.log(token);
  // console.log('====================================');
  const axios = require('axios');
let data = JSON.stringify({
  "caseNumberFull": id
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://pcl.uscourts.gov/pcl-public-api/rest/cases/find',
  headers: { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'X-NEXT-GEN-CSO': token
  },
  data : data
};

axios.request(config)
.then((response) => {
  // console.log(JSON.stringify(response.data));
  res.send(response.data)
})
.catch((error) => {
  // console.log(error,"kkk");
  res.send({status:"01",error:error.message})
});

 } catch (error) {
  // console.log('====================================');
  console.log(error);
  // console.log('====================================');
 }
  
})





app.post("/api/adv/search",async(req, res)=>{
  try {
    const { token } = req.query;
    const userData = req.body;


    const newData = filterEmptyFields(userData);
    console.log(newData);
// return  res.send(userData)
    // 
    
    const axios = require('axios');
let data = JSON.stringify(newData);

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://pcl.uscourts.gov/pcl-public-api/rest/cases/find',
  headers: { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'X-NEXT-GEN-CSO': token
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
  res.send(response.data)
})
.catch((error) => {
  // console.log(error);
  res.send(error)
});

  } catch (error) {
    console.log(error.data);
    console.error('Error:', error.message);
    res.send(error)
  }
})




app.get("/user/get/all",async(req,res)=>{
  try {
    const data = await User.find();
    res.send({data:data})
  } catch (error) {
    console.log(error);
  }
})


// app.post("/api/adv/search", async (req, res) => {
//   try {
//     const { token } = req.query;
//     const userData = req.body;

//     console.log("Received userData:", userData);

//     // Filter out empty fields
//     const newData = filterEmptyFields(userData);

//     // Respond with the filtered data
//     res.json({ data: newData });
//   } catch (error) {
//     console.error("Error processing search request:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Helper function to filter empty fields recursively
function filterEmptyFields(obj) {
  const newObj = {};

  for (let key in obj) {
    if (obj[key] === "" || obj[key] === null || obj[key] === undefined) {
      continue; // Skip empty fields
    }

    // Recursively filter nested objects or arrays
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      const nestedObj = filterEmptyFields(obj[key]);
      if (Object.keys(nestedObj).length > 0) {
        newObj[key] = nestedObj;
      }
    } else if (Array.isArray(obj[key])) {
      const filteredArray = obj[key].map(item => {
        if (typeof item === 'object' && !Array.isArray(item)) {
          return filterEmptyFields(item);
        } else {
          return item;
        }
      }).filter(item => !(item === "" || item === null || item === undefined));

      if (filteredArray.length > 0) {
        newObj[key] = filteredArray;
      }
    } else {
      newObj[key] = obj[key];
    }
  }

  return newObj;
}

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
