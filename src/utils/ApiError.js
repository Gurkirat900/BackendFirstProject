class ApiError extends Error{
    constructor(
        statusCode,
        message= "something went wrong",
        errors= []
    ){
        super(message)    // message from Error class
        this.statusCode= statusCode
        this.data= null
        this.errors= errors
        this.message= message
        this.success= false
    }
}

export {ApiError}