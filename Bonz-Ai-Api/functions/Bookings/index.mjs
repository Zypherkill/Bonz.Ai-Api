// functions/Bookings/index.js
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
	DynamoDBDocumentClient,
	GetCommand,
	PutCommand,
	UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const BOOKINGS_TABLE = 'Bookings';
const ROOM_TABLE = 'RoomTypes';

export const handler = async (event) => {
	try {
		const { guestName, rooms, totalGuests } = JSON.parse(event.body);

		let calculatedTotalGuests = 0;
		let totalPrice = 0;

		// 1️⃣ Check room availability & calculate price/guests
		for (const room of rooms) {
			const roomData = await dynamoDb.send(
				new GetCommand({
					TableName: ROOM_TABLE,
					Key: { PK: room.type },
				})
			);
			if (!roomData.Item)
				return {
					statusCode: 400,
					body: `Room type ${room.type} does not exist`,
				};
			if (room.qty > roomData.Item.availableRooms)
				return {
					statusCode: 400,
					body: `Not enough ${room.type} rooms available`,
				};

			// Calculate total guests and price
			calculatedTotalGuests += room.qty * roomData.Item.capacity;
			totalPrice += room.qty * roomData.Item.price;
		}

		// 2️⃣ Validate guest count matches the rooms
		if (totalGuests !== calculatedTotalGuests) {
			return {
				statusCode: 400,
				body: `Total guests (${totalGuests}) does not match room capacity (${calculatedTotalGuests})`,
			};
		}

		// 3️⃣ Update availableRooms in RoomTypes
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

		// 4️⃣ Create booking
		const bookingId = uuidv4();
		const bookingItem = {
			PK: bookingId,
			guestName,
			rooms,
			totalGuests,
			totalPrice,
			createdAt: new Date().toISOString(),
			status: 'confirmed',
		};

		await dynamoDb.send(
			new PutCommand({ TableName: BOOKINGS_TABLE, Item: bookingItem })
		);

		return { statusCode: 201, body: JSON.stringify(bookingItem) };
	} catch (err) {
		return { statusCode: 500, body: err.message };
	}
};
