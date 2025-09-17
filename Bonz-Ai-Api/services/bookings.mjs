import {
    DynamoDBDocumentClient,
    PutCommand,
    UpdateCommand,
    GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { generateBookingId } from '../utils/generateBookingId.mjs';

const client = new DynamoDBClient({ region: 'eu-north-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

const BOOKINGS_TABLE = 'Bookings';
const ROOMS_TABLE = 'RoomTypes';

export const addBooking = async (guestName, rooms, totalGuests, totalPrice) => {
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

    return bookingItem;
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
    const timestamp = new Date().toISOString();

    const existingBookingResult = await dynamoDb.send(
        new GetCommand({
            TableName: BOOKINGS_TABLE,
            Key: { PK: bookingId },
        })
    );

    const existingBooking = existingBookingResult.Item;
    if (!existingBooking) return null;

    let totalPrice = existingBooking.totalPrice;

    if (updates.rooms) {
        let calculatedCapacity = 0;
        totalPrice = 0; // återställ pris för att räkna om

        for (const room of updates.rooms) {
            const roomData = await dynamoDb.send(
                new GetCommand({
                    TableName: ROOMS_TABLE,
                    Key: { PK: room.type },
                })
            );

            if (!roomData.Item) {
                throw new Error(`Room type ${room.type} does not exist`);
            }

            const oldQty = existingBooking.rooms.find(r => r.type === room.type)?.qty || 0;
            const availableIncludingOld = roomData.Item.availableRooms + oldQty;

            if (room.qty > availableIncludingOld) {
                throw new Error(
                    `Not enough ${room.type} rooms available. Max: ${availableIncludingOld}`
                );
            }

            calculatedCapacity += room.qty * roomData.Item.capacity;
            totalPrice += room.qty * roomData.Item.price;
        }

        const guestsToCheck = updates.totalGuests ?? existingBooking.totalGuests;
        if (guestsToCheck > calculatedCapacity) {
            throw new Error(
                `Total guests (${guestsToCheck}) exceeds room capacity (${calculatedCapacity})`
            );
        }


        await updateAvailableRooms(bookingId, updates.rooms);
    }

    
    const updateExpressions = [];
    const expressionValues = { ':updatedAt': timestamp };

    if (updates.rooms) {
        updateExpressions.push('rooms = :rooms');
        expressionValues[':rooms'] = updates.rooms;

        const numberOfRooms = updates.rooms.reduce((sum, room) => sum + room.qty, 0);
        updateExpressions.push('numberOfRooms = :numberOfRooms');
        expressionValues[':numberOfRooms'] = numberOfRooms;

        
        updateExpressions.push('totalPrice = :totalPrice');
        expressionValues[':totalPrice'] = totalPrice;
    }

    for (const [key, value] of Object.entries(updates)) {
        if (key === 'rooms' || key === 'numberOfRooms' || key === 'totalPrice') continue;
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

    return result.Attributes;
};

