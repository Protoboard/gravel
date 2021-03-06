import {createFlameSplitter} from "flamejet";
import {connect, Node} from "flowcode";
import {ParentViewIn, ParentViewOut} from "ninety-mvvm";
import {createDomTableCellView, createDomTextView} from "ninety-ui-dom";
import {createDomStyleView} from "ninety-view-dom";

export type In = ParentViewIn;

export type Out = ParentViewOut;

export type StressTableCellView = Node<In, Out>;

export function createStressTableCellView(
  depth: number = 0
): StressTableCellView {
  const view = createDomTableCellView(depth);
  const text = createDomTextView(() => "childNodes,0:SPAN", depth + 1);
  const color = createDomStyleView("color");
  const callSplitter = createFlameSplitter({
    d_content: ["content"]
  }, depth + 1);
  const textSplitter = createFlameSplitter({
    d_color: ["color"]
  }, depth + 2);

  connect(view.o.d_vm, callSplitter.i.d_val);
  connect(callSplitter.o.d_content, text.i.d_vm);
  connect(text.o.d_vm, textSplitter.i.d_val);
  connect(textSplitter.o.d_color, color.i.d_vm);
  connect(color.o.d_view, text.i.d_view);
  connect(text.o.d_view, view.i.d_view);

  return view;
}
