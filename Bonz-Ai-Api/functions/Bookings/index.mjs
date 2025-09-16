import {
	DynamoDBDocumentClient,
	GetCommand,
	UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { addBooking } from '../services/bookings.js';

const client = new DynamoDBClient({});
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
				return {
					statusCode: 400,
					body: `Room type ${room.type} does not exist`,
				};
			}

			if (room.qty > roomData.Item.availableRooms) {
				return {
					statusCode: 400,
					body: `Not enough ${room.type} rooms available`,
				};
			}

			calculatedTotalGuests += room.qty * roomData.Item.capacity;
			totalPrice += room.qty * roomData.Item.price;
		}

		if (totalGuests > calculatedTotalGuests) {
			return {
				statusCode: 400,
				body: `Total guests (${totalGuests}) does not match room capacity (${calculatedTotalGuests})`,
			};
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

		return { statusCode: 201, body: JSON.stringify(bookingItem) };
	} catch (err) {
		return { statusCode: 500, body: err.message };
	}
};
