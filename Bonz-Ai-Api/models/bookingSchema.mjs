import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../utils/dynamoClient.mjs';


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
