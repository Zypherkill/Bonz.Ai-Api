import {
    DynamoDBDocumentClient,
    PutCommand,
    UpdateCommand,
    GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { generateBookingId } from '../utils/generateBookingId.mjs';
import { sendResponse } from '../responses/index.mjs';

const client = new DynamoDBClient({ region: 'eu-north-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

const BOOKINGS_TABLE = 'Bookings';
const ROOMS_TABLE = 'RoomTypes';

export const addBooking = async (guestName, rooms, totalGuests, totalPrice) => {
    try {
        const bookingId = generateBookingId(8);
        const timestamp = new Date().toISOString();

        const bookingItem = {
            PK: bookingId,
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

        return sendResponse(201, bookingItem);
    } catch (err) {
        return sendResponse(500, { error: err.message });
    }
};


const updateAvailableRooms = async (bookingId, newRooms) => {
    const oldBooking = await dynamoDb.send(
        new GetCommand({
            TableName: BOOKINGS_TABLE,
            Key: { PK: bookingId },
        })
    );

    const oldRooms = oldBooking.Item ? oldBooking.Item.rooms : [];
    const oldRoomMap = Object.fromEntries(oldRooms.map(r => [r.type, r.qty]));
    const newRoomMap = Object.fromEntries(newRooms.map(r => [r.type, r.qty]));
    const allTypes = new Set([...Object.keys(oldRoomMap), ...Object.keys(newRoomMap)]);

    for (const type of allTypes) {
        const oldQty = oldRoomMap[type] || 0;
        const newQty = newRoomMap[type] || 0;
        const diff = oldQty - newQty;

        if (diff !== 0) {
            await dynamoDb.send(
                new UpdateCommand({
                    TableName: ROOMS_TABLE,
                    Key: { PK: type },
                    UpdateExpression: 'SET availableRooms = availableRooms + :diff',
                    ExpressionAttributeValues: { ':diff': diff },
                })
            );
        }
    }
};

export const updateBooking = async (bookingId, updates) => {
    try {
        const timestamp = new Date().toISOString();

        const existingBookingResult = await dynamoDb.send(
            new GetCommand({
                TableName: BOOKINGS_TABLE,
                Key: { PK: bookingId },
            })
        );

        const existingBooking = existingBookingResult.Item;
        if (!existingBooking) {
            return sendResponse(404, { error: `Booking ${bookingId} not found` });
        }

        if (updates.rooms) {
            let calculatedCapacity = 0;

            for (const room of updates.rooms) {
                const roomData = await dynamoDb.send(
                    new GetCommand({
                        TableName: ROOMS_TABLE,
                        Key: { PK: room.type },
                    })
                );

                if (!roomData.Item) {
                    return sendResponse(400, { error: `Room type ${room.type} does not exist` });
                }

                calculatedCapacity += room.qty * roomData.Item.capacity;
            }

            const guestsToCheck = updates.totalGuests ?? existingBooking.totalGuests;
            if (guestsToCheck > calculatedCapacity) {
                return sendResponse(
                    400,
                    { error: `Total guests (${guestsToCheck}) exceeds room capacity (${calculatedCapacity})` }
                );
            }
        }

        if (updates.rooms) {
            await updateAvailableRooms(bookingId, updates.rooms);
        }

        const updateExpressions = [];
        const expressionValues = { ':updatedAt': timestamp };

        if (updates.rooms) {
            updateExpressions.push('rooms = :rooms');
            expressionValues[':rooms'] = updates.rooms;

            const numberOfRooms = updates.rooms.reduce(
                (sum, room) => sum + room.qty,
                0
            );
            updateExpressions.push('numberOfRooms = :numberOfRooms');
            expressionValues[':numberOfRooms'] = numberOfRooms;
        }

        for (const [key, value] of Object.entries(updates)) {
            if (key === 'rooms' || key === 'numberOfRooms') continue;
            updateExpressions.push(`${key} = :${key}`);
            expressionValues[`:${key}`] = value;
        }

        const updateExpr = `SET ${updateExpressions.join(', ')}, updatedAt = :updatedAt`;

        const result = await dynamoDb.send(
            new UpdateCommand({
                TableName: BOOKINGS_TABLE,
                Key: { PK: bookingId },
                UpdateExpression: updateExpr,
                ExpressionAttributeValues: expressionValues,
                ReturnValues: 'ALL_NEW',
            })
        );

        return sendResponse(200, result.Attributes);
    } catch (err) {
        return sendResponse(500, { error: err.message });
    }
};
