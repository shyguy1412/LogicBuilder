import { GateNode } from "@/components/circuit-components/Gate";
import { Point } from "@/lib/types/Geometry";
import { Atom, createAtom, Subscription } from "@xstate/store";
import { h } from "preact";

export namespace GraphNode {
  //having the prop for the connected pin be named differently
  //makes it harder to accidentally connect two pins of the same type together
  export type InputPin = {
    type: "input";
    parent: GraphNode;
    offset?: Point;
    pos: Atom<Point>;
    from?: OutputPin;
  };
  export type OutputPin = {
    type: "output";
    parent: GraphNode;
    pos: Atom<Point>;
    offset?: Point;
    to?: InputPin;
  };
  export type Pin = InputPin | OutputPin;
}

export abstract class GraphNode {
  protected inputs: GraphNode.InputPin[] = [];
  protected outputs: GraphNode.OutputPin[] = [];
  #pos!: Atom<Point>; // is set via the pos setter
  #posSubscription?: Subscription;

  get pos() {
    return this.#pos;
  }

  set pos(pos) {
    this.#posSubscription?.unsubscribe();
    this.#pos = pos;

    this.#posSubscription = this.#pos.subscribe((pos) => {
      for (const pin of this.pins()) {
        if (!pin.offset) return;
        pin.pos.set({
          x: pos.x + pin.offset.x,
          y: pos.y + pin.offset.y,
        });
      }
    });
  }

  constructor(pos: Atom<Point>) {
    this.pos = pos;
    this.render = this.render.bind(this);
  }

  protected createInputPin(offset?: Point): GraphNode.InputPin {
    return {
      type: "input",
      parent: this,
      offset,
      pos: createAtom({
        x: (offset?.x??0) + this.pos.get().x,
        y: (offset?.y??0) + this.pos.get().y,
      }),
      from: undefined,
    };
  }

  protected createOutputPin(offset?: Point): GraphNode.OutputPin {
    return {
      type: "output",
      parent: this,
      offset,
      pos: createAtom({
        x: (offset?.x??0) + this.pos.get().x,
        y: (offset?.y??0) + this.pos.get().y,
      }),
      to: undefined,
    };
  }

  pins(): GraphNode.Pin[] {
    return [...this.inputs, ...this.outputs];
  }

  static discriminate<T extends new (...args: any[]) => GraphNode>(
    this: T,
    target: GraphNode,
  ): target is InstanceType<typeof this> {
    return this == target.constructor;
  }

  abstract render(this: this): h.JSX.Element;
}
