import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const ROOMS_TABLE = 'RoomTypes';
const BOOKINGS_TABLE = 'Bookings';

export const handler = async (event) => {
	try {
		const bookingId = event.pathParameters?.id;

		if (!bookingId) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: 'Missing booking ID' }),
			};
		}

		// :one: Get the booking
		const bookingResult = await dynamoDb
			.get({
				TableName: BOOKINGS_TABLE,
				Key: { PK : bookingId },
			})
			.promise();

		const booking = bookingResult.Item;

		if (!booking) {
			return {
				statusCode: 404,
				body: JSON.stringify({ error: 'Booking not found' }),
			};
		}

		// :two: Restore room availability
		for (const r of booking.rooms) {
			const { type, qty } = r;

			await dynamoDb
				.update({
					TableName: ROOMS_TABLE,
					Key: { PK: type },
					UpdateExpression:
						'SET availableRooms = availableRooms + :qty',
					ExpressionAttributeValues: { ':qty': qty },
				})
				.promise();
		}

		// :three: Delete booking
		await dynamoDb
			.delete({
				TableName: BOOKINGS_TABLE,
				Key: { PK : bookingId },
			})
			.promise();

		return {
			statusCode: 200,
			body: JSON.stringify({ message: 'Booking deleted successfully' }),
		};
	} catch (error) {
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Internal Server Error' }),
		};
	}
};
