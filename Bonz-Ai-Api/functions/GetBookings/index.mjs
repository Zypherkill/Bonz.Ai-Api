import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient({});
const BOOKINGS_TABLE = 'Bookings';

export const handler = async (event) => {
  try {
    // :one: Get all bookings
    const scanParams = {
      TableName: BOOKINGS_TABLE,
    };

    const { Items: bookings } = await dynamoDbClient.send(new ScanCommand(scanParams));

    if (!bookings || bookings.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No bookings found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ bookings }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
