import { updateBooking } from '../../services/bookings.mjs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'eu-north-1' });

export const handler = async (event) => {
  try {
    const bookingId = event.pathParameters.id;
    const updates = JSON.parse(event.body);
    const updatedBooking = await updateBooking(bookingId, updates);

    if (!updatedBooking) {
      return { statusCode: 404, body: `Booking ${bookingId} not found` };
    }

    return { statusCode: 200, body: JSON.stringify(updatedBooking) };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};