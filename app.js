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

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
