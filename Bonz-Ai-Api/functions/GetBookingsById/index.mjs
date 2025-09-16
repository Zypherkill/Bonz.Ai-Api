import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const BOOKINGS_TABLE = 'Bookings';

export const handler = async (event) => {
  try {
    const bookingId = event.pathParameters?.id;

    if (!bookingId) {
      return {
        statusCode: 400,
        body: 'Missing booking ID in path',
      };
    }

    const result = await dynamoDb.send(
      new GetCommand({
        TableName: BOOKINGS_TABLE,
        Key: { PK:`BOOKING#${bookingId}` },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        body: `Booking with ID ${bookingId} not found`,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message,
    };
  }
};
