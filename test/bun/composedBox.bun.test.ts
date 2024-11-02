import { expect, test } from "bun:test";
import { plugins, wrap } from "vixeny";
import * as TypeBox from "@sinclair/typebox";
import { TypeCompiler } from '@sinclair/typebox/compiler'
import main from "../../src/typebox/composedBox.ts";
const {
  Type,
} = TypeBox;

const parser = main({
  plugins,
  TypeCompiler,
  TypeBox,
});

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

const serveMock = wrap(opt)()
  .stdPetition({
    path: "/hi",
    method: "POST",
    f: ({ typebox }) => JSON.stringify(typebox?.key),
  })
  .testRequests();

test("Validate schema with valid data", async () => {
  const validData = {
    id: 10,
    text: "Sample text",
    createdAt: Date.now(),
    userId: 50,
  };

  const request = new Request("http://hihihi.com/hi", {
    method: "POST",
    body: JSON.stringify(validData),
  });

  const response = await serveMock(request);
  const body = await response.text();
  expect(body).toBe(JSON.stringify(validData));
});

test("Reject invalid schema data", async () => {
  const invalidData = {
    id: "not-a-number",
    text: "Sample text",
    createdAt: "not-a-timestamp",
    userId: 50,
  };

  const request = new Request("http://hihihi.com/hi", {
    method: "POST",
    body: JSON.stringify(invalidData),
  });

  const response = await serveMock(request);
  const body = await response.text();

  expect(body).toBe("");
});
