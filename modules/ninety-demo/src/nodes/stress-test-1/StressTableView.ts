import {connect, Node} from "1e14";
import {createFlameBodyMapper, FlameBodyMapperIn, FlameBodyMapperOut, PathMapperCallback} from "flamejet";
import {createStressTableCellView} from "./StressTableCellView";

export type In = FlameBodyMapperIn;

export type Out = FlameBodyMapperOut;

export type StressTableView = Node<In, Out>;

export function createStressTableView(
  cb: PathMapperCallback,
  depth: number = 0
): StressTableView {
  const view = createFlameBodyMapper(cb, depth);
  const cell = createStressTableCellView(depth + 1);

  connect(view.o.d_in, cell.i.d_in);
  connect(cell.o.d_out, view.i.d_out);

  return view;
}
