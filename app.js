const express = require('express');
const axios = require('axios');

const app = express();
require('dotenv').config()
const cors = require("cors")
const stripe = require('stripe')(process.env.SKEY); // Replace 'your_secret_key' with your actual Stripe secret key
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());


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
