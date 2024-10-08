import Joi from "joi";

const pinValidationSchema = Joi.object({
  userId: Joi.string().required(),
  pin: Joi.string()
    .required()
    .length(4)
    .pattern(/^[0-9]{4}$/)
    .messages({
      "string.length": "PIN must be exactly 4 digits",
      "string.pattern.base": "PIN must contain only numbers",
    }),
});

export default pinValidationSchema;
