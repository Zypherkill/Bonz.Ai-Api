import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../../utils/dynamoClient.mjs';
import { sendResponse } from '../../responses/index.mjs';


const BOOKINGS_TABLE = 'Bookings';

export const handler = async (event) => {
	try {
		const bookingId = event.pathParameters?.id;

		if (!bookingId) {
			return sendResponse(400, { error: 'Missing booking ID in path' });
		}

		const result = await dynamoDb.send(
			new GetCommand({
				TableName: BOOKINGS_TABLE,
				Key: { PK: bookingId },
			})
		);

		if (!result.Item) {
			return sendResponse(404, {
				error: `Booking with ID ${bookingId} not found`,
			});
		}

		const formattedBooking = {
			PK: result.Item.PK,
			guestName: result.Item.guestName,
			rooms: result.Item.rooms,
			totalGuests: result.Item.totalGuests,
			totalPrice: result.Item.totalPrice,
			createdAt: result.Item.createdAt,
			updatedAt: result.Item.updatedAt,
			numberOfRooms: result.Item.numberOfRooms,
			status: result.Item.status
		};
		return sendResponse(200, formattedBooking);
	} catch (err) {
		console.error(err);
		return sendResponse(500, { error: err.message });
	}
};
