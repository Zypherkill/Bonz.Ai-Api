// bookingSchema.mjs
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: 'eu-north-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

const BOOKINGS_TABLE = 'Bookings';

// Exempel på en bokning
const bookingItem = {
	PK: uuidv4(), // unikt bookingId
	guestName: 'Anna Andersson',
	rooms: [{ type: 'single', qty: 1 }],
	totalGuests: 1,
	totalPrice: 500,
	createdAt: new Date().toISOString(),
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
