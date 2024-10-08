import Joi from "joi";

const authSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  googleId: Joi.string(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required(),
});

export default authSchema;
