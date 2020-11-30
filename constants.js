const messages = {
    requestCheck: "Kindly check your request",
    successfulAppointment: "Appointment created successfully",
    successfulTransaction: "Transaction saved successfully",
    slotsFull:
        "Slots are full for that particular date, Kindly select some other date"
};

const scanList = { CT: 7, MRI: 6, LAB: Infinity };

module.exports = { messages, scanList };
