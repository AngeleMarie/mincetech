import Joi from 'joi';


const personalValidator = Joi.object({
    userId: Joi.string(),
    fullName: Joi.string(),  // Optional as per schema definition
    address: Joi.string().required(),
    role: Joi.string().valid('individual user', 'small organization', 'other financial institution').required(),
    dateOfBirth: Joi.date().required(),
    gender: Joi.string().valid('male', 'female').required(),
    profilePicture: Joi.string()  // Optional as per schema definition
});

export default  personalValidator ;
