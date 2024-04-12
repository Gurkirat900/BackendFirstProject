const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await requestHandler(req, res, next);
        } catch (error) {
            res.status(error.code).json({
                success: false,
                message: error.message
            }) 
        }
    };
};

export { asyncHandler };
