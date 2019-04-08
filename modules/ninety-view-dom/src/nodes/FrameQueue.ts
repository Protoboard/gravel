import {createNode, Node} from "1e14";
import {FlameDiff} from "flamejet";
import {Frame} from "../types";
import {spreadDelFlame, spreadSetFlame} from "../utils";

export type In = {
  /**
   * Maximum size of complete frames.
   */
  d_fs: number;

  /**
   * View to be broken up into frames and queued.
   */
  d_view: FlameDiff;

  /**
   * Requests next frame in the queue.
   */
  ev_next: any;
};

export type Out = {
  /**
   * Next frame.
   */
  d_frame: Frame;

  /**
   * Queue length.
   */
  d_length: number;

  /**
   * Signals queue going from empty to non-empty.
   */
  ev_load: any;
};

/**
 * Breaks down and queues diffs as frames of a specified size.
 */
export type FrameQueue = Node<In, Out>;

/**
 * Creates a FrameQueue node.
 * @param fs Initial frame size
 */
export function createFrameQueue(fs: number = 512): FrameQueue {
  return createNode<In, Out>
  (["d_frame", "d_length", "ev_load"], (outputs) => {
    const frames = [];
    return {
      d_fs: (value) => {
        fs = value;
      },

      d_view: (value, tag) => {
        const lengthBefore = frames.length;
        spreadDelFlame(frames, fs, value.del);
        spreadSetFlame(frames, fs, value.set);
        const lengthAfter = frames.length;
        outputs.d_length(lengthAfter, tag);
        if (!lengthBefore && lengthAfter) {
          outputs.ev_load(null, tag);
        }
      },

      ev_next: (value, tag) => {
        if (frames.length) {
          const frame = frames.shift();
          outputs.d_frame(frame, tag);
          outputs.d_length(frames.length, tag);
        }
      }
    };
  });
}