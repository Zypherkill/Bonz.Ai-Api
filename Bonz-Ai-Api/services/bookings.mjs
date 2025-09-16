import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { generateBookingId } from '../utils/generateBookingId.mjs';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const BOOKINGS_TABLE = 'Bookings';

export const addBooking = async (guestName, rooms, totalGuests, totalPrice) => {
	const bookingId = generateBookingId(8);
	const timestamp = new Date().toISOString();

	const bookingItem = {
		PK: `BOOKING#${bookingId}`,
		id: bookingId,
		guestName,
		rooms,
		totalGuests,
		totalPrice,
		createdAt: timestamp,
		updatedAt: timestamp,
		numberOfRooms: rooms.reduce((sum, room) => sum + room.qty, 0),
		status: 'confirmed',
	};

	await dynamoDb.send(
		new PutCommand({
			TableName: BOOKINGS_TABLE,
			Item: bookingItem,
		})
	);

	return bookingItem; // returnera så handler kan skicka som response
};

export const updateBooking = async (bookingId, updates) => {
  const timestamp = new Date().toISOString();

  // bygg dynamiskt UpdateExpression
  const updateExpressions = [];
  const expressionValues = { ':updatedAt': timestamp };

  for (const [key, value] of Object.entries(updates)) {
    updateExpressions.push(`${key} = :${key}`);
    expressionValues[`:${key}`] = value;
  }

  const updateExpr = `SET ${updateExpressions.join(', ')}, updatedAt = :updatedAt`;

  const result = await dynamoDb.send(
    new UpdateCommand({
      TableName: BOOKINGS_TABLE,
      Key: { PK: `BOOKING#${bookingId}` },
      UpdateExpression: updateExpr,
      ExpressionAttributeValues: expressionValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes;
};