import {createFlameSplitter} from "gravel-core";
import {createParentView, ParentViewIn, ParentViewOut} from "gravel-view";
import {createDomPropertyView} from "gravel-view-dom";
import {connect, Node} from "river-core";

export type In = ParentViewIn;

export type Out = ParentViewOut;

export type StressTest1PageView = Node<In, Out>;

/**
 * TODO: Farm out DomButtonView
 * @param path
 * @param depth
 */
export function createStressTest1PageView(
  path: string,
  depth: number = 0
): StressTest1PageView {
  const view = createParentView(() => path, depth);
  const buttonList = createParentView(() => "childNodes,0:div", depth + 1);
  const buttonListItem = createParentView((index) =>
    "childNodes,0:div,childNodes," + index + ":button", depth + 2);
  const buttonText = createDomPropertyView("innerText");
  const splitter1 = createFlameSplitter({
    d_buttons: ["buttons"]
  }, depth + 1);
  const splitter2 = createFlameSplitter({
    d_text: ["text"]
  }, depth + 3);

  // TODO: Can we connect d_view directly to view?
  connect(view.o.d_vm, splitter1.i.d_flames);
  connect(splitter1.o.d_buttons, buttonList.i.d_vm);
  connect(buttonList.o.d_vm, buttonListItem.i.d_vm);
  connect(buttonListItem.o.d_vm, splitter2.i.d_flames);
  connect(splitter2.o.d_text, buttonText.i.d_vm);
  connect(buttonText.o.d_view, buttonListItem.i.d_view);
  connect(buttonListItem.o.d_view, buttonList.i.d_view);
  connect(buttonList.o.d_view, view.i.d_view);

  return view;
}
