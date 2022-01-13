'use strict';
const AWS = require('aws-sdk');
const API_KEY = '17048d9c56ef7169df6d6d5d912323da'
const axios = require("axios");
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const userInput = event.inputTranscript
    const {name, slots} = event.currentIntent
    const aboutPlace = ['what is this place', 'where am I', 'Where am I', 'What is this place']
    const epitechPresentation = ['I would like to have information on this school', 'what is Epitech ?', 'what is epitech']
    
    if (userInput === "I'm interested by the school")
        return {
            dialogAction: {
                type: "ElicitSlot",
                intentName: "schoolInformation",
                slots,
                slotToElicit: "Name",
            }
        }
    
    if (userInput.toLowerCase() === "i would like to leave a message")
        return {
            dialogAction: {
                type: "ElicitSlot",
                intentName: name,
                slots,
                slotToElicit: "Recipient",
            }
        }
    
    if (slots.Recipient && !slots.MessageToSend)
        return {
            dialogAction: {
                type: "ElicitSlot",
                intentName: name,
                slots,
                slotToElicit: "MessageToSend",
            }
        }
    if (slots.MessageToSend && slots.Recipient) {
        await stockMessage(slots.Recipient, slots.MessageToSend) 
        return {
            dialogAction: {
                type: "Close",
                fulfillmentState: "Fulfilled",
                message: {
                    contentType: "PlainText",
                    content: "Your message has been delivered."
                }
            }
        }
    }

    if (aboutPlace.includes(userInput))
        return {
            dialogAction: {
                type: "Close",
                fulfillmentState: "Fulfilled",
                message: {
                    contentType: "PlainText",
                    content: "This is epitech Barcelone, an IT school"
                }
            }
        }
        
    if (epitechPresentation.includes(userInput) && !slots.Pedago)
        return {
            dialogAction: {
                type: "ElicitSlot",
                intentName: name,
                slots,
                slotToElicit: "Pedago"
            }
        }
    
        
    if (slots.Pedago === "yes" && !slots.Interested)
        return {
            dialogAction: {
                type: "ElicitSlot",
                intentName: name,
                slots,
                slotToElicit: "Interested",
            }
        }
        
    if (slots.Pedago === "no" || slots.Interested === "no") {
        return {
            dialogAction: {
                type: "Close",
                fulfillmentState: "Fulfilled",
                message: {
                    contentType: "PlainText",
                    content: "Ok timal 🌝"
                }
            }
        }
    }
    if (userInput === "How long does the study last") {
        return {
            dialogAction: {
                type: "Close",
                fulfillmentState: "Fulfilled",
                message: {
                    contentType: "PlainText",
                    content: "It lasts 5 years."
                }
            }
        }
    }
    if (slots.Interested === "yes" && !slots.Name) {
        return {
            dialogAction: {
                type: "ElicitSlot",
                intentName: name,
                slots,
                slotToElicit: "Name",
            }
        }
    }
    
    if (slots.Name && !slots.Email) {
        return {
            dialogAction: {
                type: "ElicitSlot",
                intentName: name,
                slots,
                slotToElicit: "Email",
            }
        }
    }
    
    if (slots.Email && !slots.codeBackground) {
        return {
            dialogAction: {
                type: "ElicitSlot",
                intentName: name,
                slots,
                slotToElicit: "codeBackground",
            }
        }
    }
    
    if (slots.codeBackground && !slots.WorkArea) {
        return {
            dialogAction: {
                type: "ElicitSlot",
                intentName: name,
                slots,
                slotToElicit: "WorkArea",
            }
        }
    }

    if (slots.Name !== null && slots.Email !== null && slots.codeBackground !== null && slots.WorkArea) {
        await putInDB(slots.Name, slots.Email, slots.codeBackground, slots.WorkArea)
        return {
            dialogAction: {
                type: "Close",
                fulfillmentState: "Fulfilled",
                message: {
                    contentType: "PlainText",
                    content: "Okay, I hope to see you back soon as a student. Have a great day !"
                }
            }
        }
    }
    
    return {
        dialogAction: {
            type: "Delegate",
            slots
        }
    }
    
};

const putInDB = async (firstName, email, hasCoded, interestedArea) => {
    let responseBody = "";
    let statusCode = 0
    const params = {
        TableName: "UserInfo",
        Item: {
            id: new Date().getTime().toString(),
            name: firstName,
            mail: email,
            codeBackground: hasCoded,
            area: interestedArea
        }
    }
    try {
        const data = await documentClient.put(params).promise().then((data) => console.log("data => ", data)).catch((err) => console.log("error => ",err));
        const responseBody = JSON.stringify(data);
        statusCode = 201
    } catch (err) {
        console.log("error value =>", err)
        responseBody = 'error to put in DB' + err
        statusCode = 403
    }
    const response = {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: responseBody
    }
    return response
}

const stockMessage = async (firstName, message) => {
    let responseBody = "";
    let statusCode = 0
    const params = {
        TableName: "ContactPeople",
        Item: {
            uuid: new Date().getTime().toString(),
            name: firstName,
            info: message,
        }
    }
    try {
        const data = await documentClient.put(params).promise().then((data) => console.log("data => ", data)).catch((err) => console.log("error => ",err));
        const responseBody = JSON.stringify(data);
        statusCode = 201
    } catch (err) {
        console.log("error value =>", err)
        responseBody = 'error to put in DB' + err
        statusCode = 403
    }
    const response = {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: responseBody
    }
    return response
}

const sendMail = () => {
    var aws = require("aws-sdk");
    var ses = new aws.SES({ region: "us-east-1" });
    var params = {
    Destination: {
      ToAddresses: ["samuel.potter@epitech.eu"],
    },
    Message: {
      Body: {
        Text: { Data: "This is a mail from the boss" },
      },
      Subject: { Data: "Test Email" },
    },
    Source: "samuel.potter@epitech.eu",
  };
  return ses.sendEmail(params).promise()
};




