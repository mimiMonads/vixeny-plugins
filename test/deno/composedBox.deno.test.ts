import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import * as Avj from "@feathersjs/schema";
import { plugins, wrap } from "vixeny";
import * as TypeBox from "@sinclair/typebox";
import * as Vixney from "vixeny";
import main from "../../src/typebox/composedBox.ts";

const {
  Type,
} = TypeBox;

const parser = main(Vixney)(Avj)(TypeBox);
const bodyParser = parser({
  key: {
    scheme: {
      id: Type.Number(),
      text: Type.String(),
      createdAt: Type.Number(),
      userId: Type.Number(),
    },
    options: { $id: "Message", additionalProperties: false },
  },
});

const opt = plugins.globalOptions({
  cyclePlugin: {
    typebox: bodyParser,
  },
});

const serve = wrap(opt)()
  .stdPetition({
    path: "/hi",
    method: "POST",
    isAsync: true,
    f: ({ typebox }) => JSON.stringify(typebox?.key),
  }).testRequests();

Deno.test("Validate schema with valid data", async () => {
  const validData = {
    id: 10,
    text: "Sample text",
    createdAt: Date.now(),
    userId: 50,
  };

  const response = await serve(
    new Request("http://hihihi.com/hi", {
      method: "POST",
      body: JSON.stringify(validData),
    }),
  );
  const body = await response.text();

  // Since the input is valid, expect the same JSON to be returned
  assertEquals(body, JSON.stringify(validData));
});

Deno.test("Reject invalid schema data", async () => {
  const invalidData = {
    id: "not-a-number", // Invalid type
    text: "Sample text",
    createdAt: "not-a-timestamp", // Invalid type
    userId: 50,
  };

  const response = await serve(
    new Request("http://hihihi.com/hi", {
      method: "POST",
      body: JSON.stringify(invalidData),
    }),
  );

  const body = await response.text();

  // This depends on the implementation of your error handling
  assertEquals(body, ""); // Customize based on your error messages
});

Deno.test("Asynchronous route handling", async () => {
  const requestData = {
    id: 2,
    text: "Hello, Async!",
    createdAt: Date.now(),
    userId: 200,
  };

  const response = await serve(
    new Request("http://hihihi.com/hi", {
      method: "POST",
      body: JSON.stringify(requestData),
    }),
  );
  const body = await response.text();

  // Confirm that the asynchronous route returns the correct JSON response
  assertEquals(body, JSON.stringify(requestData));
});
