import { v4 as uuid } from 'uuid';

export const generateBookingId = (amount) => {
	return uuid().substring(0, amount);
};