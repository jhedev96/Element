import { el } from "../src/Element.js";

test("createElement membuat div", () => {
  const elm = el.create("div", { id: "test" }, "Hello");
  expect(elm.tagName).toBe("DIV");
  expect(elm.id).toBe("test");
  expect(elm.textContent).toBe("Hello");
});
