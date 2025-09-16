import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const ROOMS_TABLE = 'RoomTypes';
const BOOKINGS_TABLE = 'Bookings';

export const handler = async (event) => {
	try {
		const body = JSON.parse(event.body);
		const { guestName, rooms, totalGuests } = body;

		if (!guestName || !rooms || !totalGuests) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: 'Missing required fields' }),
			};
		}

		// :one: Check room availability
		let totalCapacity = 0;
		let totalPrice = 0;

		for (const r of rooms) {
			const roomType = r.type;
			const qty = r.qty;

			// Get room info
			const roomData = await dynamoDb
				.get({
					TableName: ROOMS_TABLE,
					Key: { roomType },
				})
				.promise();

			if (!roomData.Item) {
				return {
					statusCode: 400,
					body: JSON.stringify({
						error: `Invalid room type: ${roomType}`,
					}),
				};
			}

			if (roomData.Item.availableRooms < qty) {
				return {
					statusCode: 400,
					body: JSON.stringify({
						error: `Not enough ${roomType} rooms available`,
					}),
				};
			}

			totalCapacity += roomData.Item.capacity * qty;
			totalPrice += roomData.Item.price * qty;
		}

		if (totalCapacity < totalGuests) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: 'Not enough room capacity for totalGuests',
				}),
			};
		}

		// :two: Update room availability atomically
		for (const r of rooms) {
			const { type, qty } = r;
			await dynamoDb
				.update({
					TableName: ROOMS_TABLE,
					Key: { roomType: type },
					UpdateExpression:
						'SET availableRooms = availableRooms - :qty',
					ConditionExpression: 'availableRooms >= :qty',
					ExpressionAttributeValues: { ':qty': qty },
				})
				.promise();
		}

		// :three: Create booking
		const bookingId = uuidv4();
		const createdAt = new Date().toISOString();
		const bookingItem = {
			bookingId,
			guestName,
			rooms,
			totalGuests,
			totalPrice,
			createdAt,
			status: 'confirmed',
		};

		await dynamoDb
			.put({ TableName: BOOKINGS_TABLE, Item: bookingItem })
			.promise();

		return {
			statusCode: 201,
			body: JSON.stringify(bookingItem),
		};
	} catch (error) {
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Internal Server Error' }),
		};
	}
};
