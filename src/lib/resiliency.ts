/**
 * The Direct Connect Resiliency Toolkit models as topologies of connections,
 * each terminating on its own AWS device in a Direct Connect location.
 * `evaluate` answers "after these failures, is the network still reachable,
 * and with how much of the provisioned capacity?".
 */

export type ModelId = "maximum" | "high" | "dev" | "single";

export interface Connection {
  id: string;
  location: string;
}

export interface Model {
  id: ModelId;
  locations: string[];
  connections: Connection[];
}

function build(id: ModelId, perLocation: number[]): Model {
  const locations = perLocation.map((_, i) => `loc${i + 1}`);
  const connections = perLocation.flatMap((n, li) =>
    Array.from({ length: n }, (_, ci) => ({
      id: `loc${li + 1}-c${ci + 1}`,
      location: `loc${li + 1}`,
    })),
  );
  return { id, locations, connections };
}

export const MODELS: Record<ModelId, Model> = {
  maximum: build("maximum", [2, 2]),
  high: build("high", [1, 1]),
  dev: build("dev", [2]),
  single: build("single", [1]),
};

export interface Failures {
  connections: string[];
  locations: string[];
}

export interface Outcome {
  connected: boolean;
  surviving: string[];
  /** Share of provisioned capacity still available, 0..1. */
  capacity: number;
}

export function evaluate(model: Model, f: Failures): Outcome {
  const surviving = model.connections
    .filter((c) => !f.connections.includes(c.id) && !f.locations.includes(c.location))
    .map((c) => c.id);
  return {
    connected: surviving.length > 0,
    surviving,
    capacity: surviving.length / model.connections.length,
  };
}

/** Does the model stay up after losing any one connection? */
export function survivesAnyConnectionLoss(model: Model): boolean {
  return model.connections.every(
    (c) => evaluate(model, { connections: [c.id], locations: [] }).connected,
  );
}

/** Does the model stay up after losing any one whole location? */
export function survivesAnyLocationLoss(model: Model): boolean {
  return model.locations.every(
    (l) => evaluate(model, { connections: [], locations: [l] }).connected,
  );
}

/**
 * Does the model stay up after losing a whole location AND one more
 * connection somewhere else? This is what separates Maximum from High.
 */
export function survivesLocationPlusConnection(model: Model): boolean {
  return (
    survivesAnyLocationLoss(model) &&
    model.locations.every((l) =>
      model.connections
        .filter((c) => c.location !== l)
        .every((c) => evaluate(model, { connections: [c.id], locations: [l] }).connected),
    )
  );
}
