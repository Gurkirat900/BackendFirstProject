class ApiError extends Error{
    constructor(
        statusCode,
        message= "something went wrong",
        errors= []
    ){
        super(message)    // message from Error class
        this.statusCode= statusCode
        this.message= message
        this.data= null
        this.errors= errors
        this.success= false
    }
}

export {ApiError}