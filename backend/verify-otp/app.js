const AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

let response;

exports.lambdaHandler = async (event, context) => {
  let Body = JSON.parse(event.body);

  if (!Body.sessionId || !Body.token) {
    return {
      statusCode: 422,
      headers: {
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: "Required fields not found.",
        error: "token and sessionId required",
      }),
    };
  }

  let data = await fetchSessionData(Body.sessionId + "_" + Body.token);
  try {
    if (
      data[0] !== undefined &&
      data[0]["expiryAt"] > Math.floor(new Date().getTime() / 1000)
    ) {
      response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: "Validated",
        }),
      };
    } else {
      response = {
        statusCode: 422,
        headers: {
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: "Cannot validate OTP.",
        }),
      };
    }
  } catch (err) {
    console.log(err);
    response = {
      statusCode: 422,
      headers: {
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: "Cannot validate OTP.",
      }),
    };
  }

  return response;
};

async function fetchSessionData(pk) {
  var params = {
    ExpressionAttributeValues: {
      ":pk": pk,
    },
    KeyConditionExpression: "pk = :pk",
    TableName: process.env.DB_TABLE,
  };
  console.log(params);
  let data = await docClient.query(params).promise();

  return data.Items;
}
