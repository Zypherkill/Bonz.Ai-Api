import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { sendResponse } from '../../responses/index.mjs';

const client = new DynamoDBClient({ region: 'eu-north-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

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

		return sendResponse(200, result.Item);
	} catch (err) {
		console.error(err);
		return sendResponse(500, { error: err.message });
	}
};
