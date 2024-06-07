import { Type, type Static } from '@sinclair/typebox'
import { Ajv } from '@feathersjs/schema'

const messageSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String(),
    createdAt: Type.Number(),
    userId: Type.Number()
  },
  { $id: 'Message', additionalProperties: false }
)

type Message = Static<typeof messageSchema>

const dataValidator = new Ajv()
// Compile the schema to a validator function
 const validate = dataValidator.compile(messageSchema)


// Example message to validate
const message = {
  id: 1,
  text: "Hello, world!",
  createdAt: Date.now(),
  userId: 123
};

// Perform the validation
if (validate(message)) {
  console.log('Message is valid!');
} else {
  console.log('Validation errors:', validate.errors);
}