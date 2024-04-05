// File made with the assistance of Chat-GPT
const ApiStats = require('./apiSchema');

const recordApiCall = async (req, res, next) => {
    try {
        console.log('Recording API call:', req.method, req.originalUrl);
        // Use req.originalUrl or req.path depending on whether you want the query string included
        const endpoint = req.originalUrl;
        const method = req.method;

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
