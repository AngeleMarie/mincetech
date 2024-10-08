import Joi from "joi";

const storeSchema = Joi.object({
  storeName: Joi.string().required(),
  email: Joi.string().email().required(),
  googleId: Joi.string(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .required(),
  secretKey: Joi.string().required(),
  city: Joi.string().required(),
  role: Joi.string().required(),
  country: Joi.string().required(),
  postalCode: Joi.string().required(),
  postalCode: Joi.string().required(),
});

export default storeSchema;
