export const sendResponse = (status, data) => {
	return {
		statusCode: status,
		body: JSON.stringify({
			...data,
		}),
	};
};