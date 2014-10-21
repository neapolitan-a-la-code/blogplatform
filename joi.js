//numbers
var schema = Joi.number().integer().min(0).max(65535);
Joi.validate(6464, schema);

// Let’s use Joi.object() to create a schema to match a mock configuration for a HTTP server. Here are the constraints we’ll implement:

// bindhost key — host/interface for the server to bind to (IPv4 or IPv6). A required key.
// port key — TCP port (the validation we did earlier). A required key.
// endpoints — object mapping some handlers to certain endpoints, with the root path (/) being required.
// database key — object specifying database options. host must be a string and present in the object, name must be a string containing only [a-zA-Z0-9] and underscores, and port is an optional integer, defaulting to 5050.

var portSchema = Joi.number().integer().min(0).max(65535);
var configSchema = Joi.object({
    bindhost: Joi.string().required(),
    port: portSchema.required(),
    endpoints: Joi.object({
        "/": Joi.string().required(),
        "/customers": Joi.string().default("customersHandler").optional()
    }),
    database: Joi.object({
        host: Joi.string().required(),
        name: Joi.string().token().max(20),
        port: portSchema.default(5050).optional()
    })
});

//define a configuration as a normal JavaScript object and call on Joi to validate it against our schema
var config = {
    bindhost: "127.0.0.1",
    port: 8081,
    endpoints: {
        "/": "rootHandler"
    },
    database: {
        host: "192.168.0.106"
    }
}
var result = Joi.validate(config, configSchema);
console.log(result ? result.annotated() : null);
