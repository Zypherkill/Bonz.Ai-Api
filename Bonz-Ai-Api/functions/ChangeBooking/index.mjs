import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../../utils/dynamoClient.mjs';
import { updateBooking } from '../../services/bookings.mjs';
import { sendResponse } from '../../responses/index.mjs';


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

		const formattedBooking = {
            PK: updatedBooking.PK,
            guestName: updatedBooking.guestName,
            rooms: updatedBooking.rooms,
            totalGuests: updatedBooking.totalGuests,
            totalPrice: updatedBooking.totalPrice,
            createdAt: updatedBooking.createdAt,
            updatedAt: updatedBooking.updatedAt,
            numberOfRooms: updatedBooking.numberOfRooms,
            status: updatedBooking.status
        };

        return sendResponse(200, formattedBooking );
    } catch (err) {
        if (err.message.includes('exceeds room capacity') || err.message.includes('does not exist')) {
            return sendResponse(400, { error: err.message });
        }
        return sendResponse(500, { error: err.message });
    }
};
