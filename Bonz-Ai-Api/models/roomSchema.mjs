import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'eu-north-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

const ROOM_TABLE = 'RoomTypes';

const rooms = [
	{
		roomType: 'single',
		totalRooms: 7,
		availableRooms: 7,
		capacity: 1,
		price: 500,
	},
	{
		roomType: 'double',
		totalRooms: 7,
		availableRooms: 7,
		capacity: 2,
		price: 1000,
	},
	{
		roomType: 'suite',
		totalRooms: 6,
		availableRooms: 6,
		capacity: 3,
		price: 1500,
	},
];

async function seedRooms() {
	try {
		for (const room of rooms) {
			await dynamoDb.send(
				new PutCommand({ TableName: ROOM_TABLE, Item: room })
			);
		}
		console.log('Rooms seeded successfully!');
	} catch (err) {
		console.error('Error seeding rooms:', err);
	}
}

seedRooms();
