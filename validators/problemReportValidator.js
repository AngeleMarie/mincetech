import Joi from "joi";

const reportSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  message: Joi.string().min(1).required(),
});

const validateReport = (req, res, next) => {
  const { error } = reportSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export default validateReport;
