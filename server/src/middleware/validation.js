import Joi from 'joi';

// Validation schemas
const chatMessageSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
  message: Joi.string().max(1000).optional(),
  messageType: Joi.string().valid('text', 'start', 'quick_response').default('text')
});

const initSessionSchema = Joi.object({
  productId: Joi.string().optional(),
  userData: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    preferences: Joi.object().optional()
  }).optional()
});

// Validation middleware
export const validateChatRequest = (req, res, next) => {
  const { error } = chatMessageSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  next();
};

export const validateInitSession = (req, res, next) => {
  const { error } = initSessionSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  next();
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove any potential script tags
  input = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove any HTML tags
  input = input.replace(/<[^>]*>/g, '');
  
  // Trim whitespace
  input = input.trim();
  
  return input;
};