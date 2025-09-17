import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { updateBooking } from '../../services/bookings.mjs';
import { sendResponse } from '../../responses/index.mjs';

const client = new DynamoDBClient({ region: 'eu-north-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const bookingId = event.pathParameters.id;
        const updates = JSON.parse(event.body);

        const updatedBooking = await updateBooking(bookingId, updates);

        if (!updatedBooking) {
            return sendResponse(404, {
                error: `Booking ${bookingId} not found`,
            });
        }

        return sendResponse(200, updatedBooking);
    } catch (err) {
        if (err.message.includes('exceeds room capacity') || err.message.includes('does not exist')) {
            return sendResponse(400, { error: err.message });
        }
        return sendResponse(500, { error: err.message });
    }
};
