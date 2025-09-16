import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient({ region: 'eu-north-1' });
const ROOMS_TABLE = 'RoomTypes';
const BOOKINGS_TABLE = 'Bookings';

export const handler = async (event) => {
  try {
    const bookingId = event.pathParameters?.id;

    if (!bookingId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing booking ID' }),
      };
    }

    // :one: Get the booking
    const getBookingParams = {
      TableName: BOOKINGS_TABLE,
      Key: { PK: bookingId },
    };

    const { Item: booking } = await dynamoDbClient.send(new GetCommand(getBookingParams));

    if (!booking) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Booking not found' }),
      };
    }

    // :two: Restore room availability
    for (const r of booking.rooms) {
      const { type, qty } = r;

      const updateParams = {
        TableName: ROOMS_TABLE,
        Key: { PK: type },
        UpdateExpression: 'SET availableRooms = availableRooms + :qty',
        ExpressionAttributeValues: { ':qty': qty },
      };

      await dynamoDbClient.send(new UpdateCommand(updateParams));
    }

    // :three: Delete booking
    const deleteParams = {
      TableName: BOOKINGS_TABLE,
      Key: { PK: bookingId },
    };

    await dynamoDbClient.send(new DeleteCommand(deleteParams));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Booking deleted successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
