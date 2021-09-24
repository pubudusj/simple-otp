const AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();
var validator = require("email-validator");

let otpExpiryTime = process.env.OTP_EXPIRY_MINUTES;

exports.lambdaHandler = async (event, context) => {
  let Body = JSON.parse(event.body);

  if (!validator.validate(Body.email)) {
    return {
      statusCode: 422,
      body: JSON.stringify({
        message: "Required field email not found or invalid",
      }),
    };
  }

  let sessionToken = gerRandomString(32);
  let otp = gerRandomString(process.env.TOKEN_LENGTH, true);

  var params = {
    Item: {
      pk: sessionToken + "_" + otp,
      email: Body.email,
      expiryAt: Math.floor(new Date().getTime() / 1000) + otpExpiryTime * 60,
    },
    ReturnConsumedCapacity: "TOTAL",
    TableName: process.env.DB_TABLE,
  };

  try {
    await docClient.put(params).promise();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: "OTP generated",
        data: {
          token: sessionToken,
        },
      }),
    };
  } catch (error) {
    console.error("Error", error.stack);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: "OTP generation failed",
        error: error.stack,
      }),
    };
  }
};

function gerRandomString(length, onlyNumbers = false) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  if (onlyNumbers === true) {
    var characters = "0123456789";
  }
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
