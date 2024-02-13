const Joi = require("joi");

module.exports.userSchema = Joi.object({
  username: Joi.string().required,
  first_name: Joi.string().required,
  last_name: Joi.string().required,
  email: Joi.string().email().required,
  display_image: Joi.string(),
});
