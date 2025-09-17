import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
	DynamoDBDocumentClient,
	GetCommand,
	UpdateCommand,
	DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { sendResponse } from '../../responses/index.mjs';

const client = new DynamoDBClient({ region: 'eu-north-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

const ROOMS_TABLE = 'RoomTypes';
const BOOKINGS_TABLE = 'Bookings';

export const handler = async (event) => {
	try {
		const bookingId = event.pathParameters?.id;

		if (!bookingId) {
			return sendResponse(400, { error: 'Missing booking ID' });
		}

		const { Item: booking } = await dynamoDb.send(
			new GetCommand({
				TableName: BOOKINGS_TABLE,
				Key: { PK: bookingId },
			})
		);

		if (!booking) {
			return sendResponse(404, { error: 'Booking not found' });
		}

		for (const { type, qty } of booking.rooms) {
			await dynamoDb.send(
				new UpdateCommand({
					TableName: ROOMS_TABLE,
					Key: { PK: type },
					UpdateExpression:
						'SET availableRooms = availableRooms + :qty',
					ExpressionAttributeValues: { ':qty': qty },
				})
			);
		}

		await dynamoDb.send(
			new DeleteCommand({
				TableName: BOOKINGS_TABLE,
				Key: { PK: bookingId },
			})
		);

		return sendResponse(200, { message: 'Booking deleted successfully' });
	} catch (error) {
		console.error(error);
		return sendResponse(500, { error: 'Internal Server Error' });
	}
};
