// File made with the assistance of Chat-GPT
const ApiStats = require('./apiSchema');

const recordApiCall = async (req, res, next) => {
    try {
        let endpoint = req.originalUrl;
        const method = req.method;

        // Remove the user ID from the endpoint if it exists
        const userIdPattern = /\/[0-9a-fA-F]{24}/; // Regex pattern to match MongoDB ObjectId
        endpoint = endpoint.replace(userIdPattern, '');

        // Record the API call in the database
        await ApiStats.updateOne(
            { endpoint, method },
            { $inc: { requestCount: 1 } },
            { upsert: true } // If the document doesn't exist, create it
        );
    } catch (error) {
        console.error('Error recording API call:', error);
        // Handle the error as needed
    }
    next(); // Continue to the actual route handler
};

module.exports = recordApiCall;
