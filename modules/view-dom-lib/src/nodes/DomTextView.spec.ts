import {connect} from "river-core";
import {createDomTextView, DomTextView} from "./DomTextView";

describe("createDomTextView()", () => {
  describe("on input (vm_diff)", () => {
    let node: DomTextView;

    beforeEach(() => {
      node = createDomTextView("foo");
    });

    describe("on set", () => {
      it("should emit mapped vm on 'v_diff'", () => {
        const spy = jasmine.createSpy();
        connect(node.o.v_diff, spy);
        node.i.vm_diff({
          del: {},
          set: {content: "Hello"}
        }, "1");
        expect(spy).toHaveBeenCalledWith({
          del: {},
          set: {"foo.innerText": "Hello"}
        }, "1");
      });
    });

    describe("on del", () => {
      it("should emit mapped vm on 'v_diff'", () => {
        const spy = jasmine.createSpy();
        connect(node.o.v_diff, spy);
        node.i.vm_diff({
          del: {content: null},
          set: {}
        }, "1");
        expect(spy).toHaveBeenCalledWith({
          del: {"foo.innerText": null},
          set: {}
        }, "1");
      });
    });
  });
});