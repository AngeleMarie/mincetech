// validators/billingValidator.js
import Joi from "joi";

const billingDetailsSchema = Joi.object({
  cardNumber: Joi.string().required(),
  cardHolderName: Joi.string().required(),
  expirationDate: Joi.string().required(),
  cvv: Joi.string().required(),
  email: Joi.string().email(),
  phoneNumber: Joi.string(),
});

const billingAccountSchema = Joi.object({
  method: Joi.string()
    .valid("MoMo Pay", "PayPal", "Mastercard", "Visa")
    .required(),
  details: billingDetailsSchema.required(),
});

const billingValidator = Joi.object({
  userId: Joi.string().optional(),
  plan: Joi.string().valid("Basic", "Premium", "Free Trial").required(),
  accounts: Joi.array().items(billingAccountSchema).required(),
});

export default billingValidator;
