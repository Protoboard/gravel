import {connect, Node} from "1e14";
import {
  createDomStyleView,
  createFlameDiffSplitter,
  ParentViewIn,
  ParentViewOut
} from "ninety";
import {createDomTableCellView, createDomTextView} from "ninety-dom-ui";

export type In = ParentViewIn;

export type Out = ParentViewOut;

export type StressTableCellView = Node<In, Out>;

export function createStressTableCellView(
  depth: number = 0
): StressTableCellView {
  const view = createDomTableCellView(depth);
  const text = createDomTextView(() => "childNodes,0:span", depth + 1);
  const color = createDomStyleView("color");
  const callSplitter = createFlameDiffSplitter({
    d_content: ["content"]
  }, depth + 1);
  const textSplitter = createFlameDiffSplitter({
    d_color: ["color"]
  }, depth + 2);

  connect(view.o.d_vm, callSplitter.i.d_diff);
  connect(callSplitter.o.d_content, text.i.d_vm);
  connect(text.o.d_vm, textSplitter.i.d_diff);
  connect(textSplitter.o.d_color, color.i.d_vm);
  connect(color.o.d_view, text.i.d_view);
  connect(text.o.d_view, view.i.d_view);

  return view;
}