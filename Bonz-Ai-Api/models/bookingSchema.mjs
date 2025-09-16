import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'eu-north-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

const BOOKINGS_TABLE = 'Bookings';

const bookingId = generateBookingId(8);
		const bookingItem = {
			PK: bookingId,
			guestName,
			rooms,
			totalGuests,
			totalPrice,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			numberOfRooms: rooms.reduce((sum, room) => sum + room.qty, 0),
			status: 'confirmed',
		};

async function seedBooking() {
	try {
		await dynamoDb.send(
			new PutCommand({ TableName: BOOKINGS_TABLE, Item: bookingItem })
		);
		console.log('Booking seeded successfully!');
	} catch (err) {
		console.error('Error seeding booking:', err);
	}
}

seedBooking();
