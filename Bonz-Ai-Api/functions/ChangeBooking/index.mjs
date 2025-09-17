import { updateBooking } from '../../services/bookings.mjs';
import { sendResponse } from '../../responses/index.mjs';

export const handler = async (event) => {
	try {
		const bookingId = event.pathParameters.id;
		const updates = JSON.parse(event.body);

		const updatedBooking = await updateBooking(bookingId, updates);

		if (!updatedBooking) {
			return sendResponse(404, {
				error: `Booking ${bookingId} not found`,
			});
		}

		return sendResponse(200, updatedBooking);
	} catch (err) {
		return sendResponse(500, { error: err.message });
	}
};
