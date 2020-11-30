var express = require("express"),
    cors = require("cors"),
    app = express(),
    port = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

var routes = require("./routes/billing-routes");

routes(app);

global.patientDetails = global.patientDetails || [];
global.billingDetails = global.billingDetails || [];
global.transactions = global.transactions || [];

app.listen(port);

console.log("Server started on port no: " + port);
