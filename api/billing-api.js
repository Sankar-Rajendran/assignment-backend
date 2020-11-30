const { v4: uuidv4 } = require("uuid");

const { messages, scanList } = require("../constants");

const checkAvailableSlots = (billingDetails) => {
    //Checks availability of the Scans for that date
    //Per days counts are defined in constant file
    const scanCounts = { CT: 0, MRI: 0, LAB: 0 };
    let availability = true;
    if (global.billingDetails.length > 0) {
        const appointments = global.billingDetails.filter(
            (x) => x.appointmentDate === billingDetails.appointmentDate
        );
        if (appointments.length > 0) {
            appointments.forEach((appointment) => {
                appointment.scanNames.split(",").forEach((scanName) => {
                    scanCounts[scanName] = scanCounts[scanName] + 1;
                });
            });
            const currentScanItem = billingDetails.scanNames.split(",");
            currentScanItem.forEach((item) => {
                if (scanCounts[item] >= scanList[item]) {
                    availability = false;
                }
            });
        }
    }
    return availability;
};

exports.getAppointment = function (req, res) {
    try {
        let appointments = [];
        const searchParam = req.body.searchParam;
        if (global.billingDetails.length > 0) {
            const billingDetails = global.billingDetails;
            if (billingDetails.length > 0) {
                appointments = billingDetails.filter((item) => {
                    const appointmentDate = Date.parse(item.appointmentDate);
                    if (item.status !== searchParam.billingStatus) {
                        return false;
                    }
                    if (
                        searchParam.fromDate &&
                        appointmentDate < Date.parse(searchParam.fromDate)
                    ) {
                        return false;
                    }
                    if (
                        searchParam.toDate &&
                        appointmentDate > Date.parse(searchParam.toDate)
                    ) {
                        return false;
                    }
                    if (
                        searchParam.searchText &&
                        item.patientName.indexOf(searchParam.searchText) === -1
                    ) {
                        return false;
                    }
                    return true;
                });
            }
        }
        res.status(200).send(appointments || []);
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: messages.requestCheck });
    }
};

exports.createAppointment = function (req, res) {
    try {
        const patientDetails = req.body.patientDetails;
        const billingDetails = req.body.billingDetails;
        const patientID = uuidv4();
        const billingID = uuidv4();
        if (checkAvailableSlots(billingDetails)) {
            global.patientDetails.push({
                patientID: patientID,
                ...patientDetails
            });
            global.billingDetails.push({
                patientID: patientID,
                billingID: billingID,
                ...billingDetails
            });
            res.status(200).send({ message: messages.successfulAppointment });
        } else {
            res.status(200).send({ error: messages.slotsFull });
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: messages.requestCheck });
    }
};

exports.getBillingDetails = function (req, res) {
    try {
        let responseObj = {};
        const billingId = req.query.billingId;

        if (billingId) {
            const billingDetails = global.billingDetails.find(
                (x) => x.billingID == billingId
            );
            const transactions = global.transactions.filter(
                (x) => x.billingID == billingId
            );
            if (billingDetails) {
                const patientDetails = global.patientDetails.find(
                    (x) => x.patientID == billingDetails.patientID
                );
                responseObj = {
                    patientName: patientDetails.patientName,
                    patientID: patientDetails.patientID,
                    age: patientDetails.age,
                    gender: patientDetails.gender,
                    totalAmount: billingDetails.totalAmount,
                    discount: billingDetails.discount,
                    status: billingDetails.status,
                    amountPaid: billingDetails.amountPaid,
                    balanceAmount: billingDetails.balanceAmount,
                    transactions: transactions || []
                };
            }
            res.status(200).send(responseObj);
        } else {
            res.status(400).send({ error: messages.requestCheck });
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: messages.requestCheck });
    }
};

exports.saveTransaction = function (req, res) {
    try {
        const transactionDetails = req.body.transaction;
        const transactionObj = {
            transactionID: uuidv4(),
            ...transactionDetails
        };
        global.transactions.push(transactionObj);
        const billingIndex = global.billingDetails.findIndex(
            (x) => x.billingID === transactionObj.billingID
        );
        const billingDetails = global.billingDetails[billingIndex];
        const amountPaid =
            Number(billingDetails.amountPaid) +
            Number(transactionObj.paymentAmount);
        billingDetails.noOfTransactions =
            Number(billingDetails.noOfTransactions) + 1;
        billingDetails.amountPaid = amountPaid;
        billingDetails.status =
            amountPaid >= billingDetails.totalAmount
                ? "fullyPaid"
                : "dueBilled";
        billingDetails.balanceAmount = billingDetails.totalAmount - amountPaid;
        global.billingDetails[billingIndex] = billingDetails;
        res.status(200).send({ message: messages.successfulTransaction });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: messages.requestCheck });
    }
};
