const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.login = async (event) => {  // Ensure this matches what you have in serverless.yml
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        const { username, password } = JSON.parse(event.body);
        console.log('Parsed input:', { username, password });

        if (!username || !password) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",  // Replace '*' with your allowed origin
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                },
                body: JSON.stringify({ success: false, message: 'Username and password are required' }),
            };
        }

        const params = {
            TableName: 'users', // Update this with your actual DynamoDB table name
            Key: { username },
        };

        const result = await dynamoDb.get(params).promise();
        const user = result.Item;

        if (!user) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",  // Replace '*' with your allowed origin
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                },
                body: JSON.stringify({ success: false, message: 'User not found' }),
            };
        }

        // Assuming user object has a password field; validate it
        if (user.password !== password) {
            return {
                statusCode: 401,
                headers: {
                    "Access-Control-Allow-Origin": "*",  // Replace '*' with your allowed origin
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                },
                body: JSON.stringify({ success: false, message: 'Invalid password' }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",  // Replace '*' with your allowed origin
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({ success: true, message: 'User authenticated successfully', role: user.role }),
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",  // Replace '*' with your allowed origin
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({ success: false, message: 'Internal server error', error: error.message }),
        };
    }
};
