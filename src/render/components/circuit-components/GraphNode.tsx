import { LogicOperation } from "@/components/circuit-components/Gate";
import { Atom, createAtom } from "@xstate/store";
import { Point } from "electron";
import { h } from "preact";

export namespace GraphNode {
  export type InputPin = {
    parent: GraphNode;
    from?: OutputPin;
  };
  export type OutputPin = {
    parent: GraphNode;
    to: InputPin[];
  };
}

export abstract class GraphNode {
  inputs: GraphNode.InputPin[] = [];
  outputs: GraphNode.OutputPin[] = [];
  pos: Atom<Point>;

  constructor(pos: Atom<Point>) {
    this.pos = pos;
  }

  createInputPin(): GraphNode.InputPin {
    return {
      parent: this,
      from: undefined,
    };
  }

  createOutputPin(): GraphNode.OutputPin {
    return {
      parent: this,
      to: [],
    };
  }

  static discriminate<T extends new (...args: any[]) => GraphNode>(
    this: T,
    target: GraphNode,
  ): target is InstanceType<typeof this> {
    return this == target.constructor;
  }

  abstract render(): h.JSX.Element;
}
