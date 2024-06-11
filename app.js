const express = require('express');
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


const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
