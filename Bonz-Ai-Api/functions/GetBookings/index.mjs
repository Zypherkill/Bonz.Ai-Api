import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../../utils/dynamoClient.mjs';
import { sendResponse } from '../../responses/index.mjs';


const BOOKINGS_TABLE = 'Bookings';

export const handler = async () => {
	try {
		const scanParams = {
			TableName: BOOKINGS_TABLE,
		};

		const { Items: bookings } = await dynamoDb.send(
			new ScanCommand(scanParams)
		);

		if (!bookings || bookings.length === 0) {
			return sendResponse(404, { error: 'No bookings found' });
		}

		const formattedBookings = bookings.map(b => ({
            PK: b.PK,
            guestName: b.guestName,
            rooms: b.rooms,
            totalGuests: b.totalGuests,
            totalPrice: b.totalPrice,
            createdAt: b.createdAt,
            updatedAt: b.updatedAt,
            numberOfRooms: b.numberOfRooms,
            status: b.status
        }));

        return sendResponse(200, formattedBookings);
	} catch (error) {
		console.error(error);
		return sendResponse(500, { error: 'Internal Server Error' });
	}
};
