"use strict";
module.exports = function (app) {
    var billingAPI = require("../api/billing-api");

    app.route("/createappointment").post(billingAPI.createAppointment);

    app.route("/appointments").post(billingAPI.getAppointment);

    app.route("/billingdetails").get(billingAPI.getBillingDetails);

    app.route("/transaction").post(billingAPI.saveTransaction);
};
