import Joi from "joi";

const WaitlistJoi = Joi.object({
    email: Joi.string().email().required()
})


export default WaitlistJoi;