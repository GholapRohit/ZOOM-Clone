// Import Joi for schema validation
import joi from "joi";
// Import HTTP status codes for readable responses
import httpStatus from "http-status";

const signUpValidations = (req, res, next) => {
  const schema = joi.object({
    name: joi.string().min(3).max(100).required(),
    username: joi.string().required(),
    password: joi.string().min(6).max(100).required(),
  });
  let { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: error.details[0].message, success: false });
  }
  next();
};

const loginValidations = (req, res, next) => {
  const schema = joi.object({
    username: joi.string().required(),
    password: joi.string().min(6).max(100).required(),
  });
  let { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: error.details[0].message, success: false });
  }
  next();
};

export { signUpValidations, loginValidations };
