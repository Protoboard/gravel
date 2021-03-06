import {Flame} from "flamejet";
import {IdListsByModelType, Model, ReferenceTypes} from "../types";

/**
 * Creates a mapper function that extracts references a model according to
 * the specified reference config.
 * @param model Model to extract fields from.
 * @param config Defines which fields correspond to references of a
 * certain (model) type.
 */
export function extractFields<S extends Flame, R extends ReferenceTypes<S> = ReferenceTypes<S>>(
  model: Model<S>,
  config: R
): IdListsByModelType<R[keyof R]> {
  const result = <IdListsByModelType<R[keyof R]>>{};
  for (const id in model) {
    const entry = model[id];
    if (entry) {
      for (const field in config) {
        if (field in entry) {
          const type = config[field];
          const ids = result[type] || (result[type] = []);
          ids.push(entry[field]);
        }
      }
    }
  }
  return result;
}
