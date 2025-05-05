import { Point } from "@/lib/types/Geometry";
import { Atom, createAtom } from "@xstate/store";
import { h } from "preact";

export namespace GraphNode {
  export type InputPin = {
    parent: GraphNode;
    pos: Atom<Point>;
    from?: OutputPin;
  };
  export type OutputPin = {
    parent: GraphNode;
    pos: Atom<Point>;
    to: InputPin[];
  };
  export type Pin = InputPin | OutputPin;
}

export abstract class GraphNode {
  protected inputs: GraphNode.InputPin[] = [];
  protected outputs: GraphNode.OutputPin[] = [];
  protected pos: Atom<Point>;

  constructor(pos: Atom<Point>) {
    this.pos = pos;
  }

  protected createInputPin(): GraphNode.InputPin {
    return {
      parent: this,
      pos: createAtom({x:0, y:0}),
      from: undefined,
    };
  }

  protected createOutputPin(): GraphNode.OutputPin {
    return {
      parent: this,
      pos: createAtom({x:0, y:0}),
      to: [],
    };
  }

  pins(): GraphNode.Pin[] {
    console.log("PINNING");

    return [...this.inputs, ...this.outputs];
  }

  static discriminate<T extends new (...args: any[]) => GraphNode>(
    this: T,
    target: GraphNode,
  ): target is InstanceType<typeof this> {
    return this == target.constructor;
  }

  abstract render(): h.JSX.Element;
}
