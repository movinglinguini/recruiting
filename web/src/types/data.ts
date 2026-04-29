// Input data from the simulation
export type Vec3 = { x: number; y: number; z: number };
export type AgentData = {
  position: Vec3;
  velocity: Vec3;
  mass: number;
  time?: number;
  timeStep?: number;
};
export type DataFrame = Record<string, AgentData>;
export type DataPoint = [number, number, DataFrame];

// Output data to the plot
export type PlottedAgentData = Record<string, number[]>;
export type PlottedFrame = Record<string, PlottedAgentData>;

export type SimulationData = {
  data: DataPoint[],
  velocities: PlottedFrame,
  positions: PlottedFrame, 
}