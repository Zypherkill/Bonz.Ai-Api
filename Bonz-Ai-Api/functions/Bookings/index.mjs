import {
	DynamoDBDocumentClient,
	GetCommand,
	UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { addBooking } from '../../services/bookings.mjs';
import { sendResponse } from '../../responses/index.mjs';

const client = new DynamoDBClient({ region: 'eu-north-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

const ROOM_TABLE = 'RoomTypes';

export const handler = async (event) => {
	try {
		const { guestName, rooms, totalGuests } = JSON.parse(event.body);

		let calculatedTotalGuests = 0;
		let totalPrice = 0;

		for (const room of rooms) {
			const roomData = await dynamoDb.send(
				new GetCommand({
					TableName: ROOM_TABLE,
					Key: { PK: room.type },
				})
			);

			if (!roomData.Item) {
				return sendResponse(400, {
					error: `Room type ${room.type} does not exist`,
				});
			}

			if (room.qty > roomData.Item.availableRooms) {
				return sendResponse(400, {
					error: `Not enough ${room.type} rooms available`,
				});
			}

			calculatedTotalGuests += room.qty * roomData.Item.capacity;
			totalPrice += room.qty * roomData.Item.price;
		}

		if (totalGuests > calculatedTotalGuests) {
			return sendResponse(400, {
				error: `Total guests (${totalGuests}) exceeds room capacity (${calculatedTotalGuests})`,
			});
		}

		for (const room of rooms) {
			await dynamoDb.send(
				new UpdateCommand({
					TableName: ROOM_TABLE,
					Key: { PK: room.type },
					UpdateExpression:
						'SET availableRooms = availableRooms - :qty',
					ExpressionAttributeValues: { ':qty': room.qty },
				})
			);
		}

		const bookingItem = await addBooking(
			guestName,
			rooms,
			totalGuests,
			totalPrice
		);

		return sendResponse(201, bookingItem);
	} catch (err) {
		return sendResponse(500, { error: err.message });
	}
};