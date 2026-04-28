// Input data from the simulation
export type AgentData = Record<string, Record<string, number>>;
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