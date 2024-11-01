const joi = require("joi");

export const FilemanagerjoiSchema = joi.object({
  originalname: joi.string().required(),
  format: joi.string().required(),
  width: joi.number().required(),
  height: joi.number().required(),
  secure_url: joi.string().required(),
});
