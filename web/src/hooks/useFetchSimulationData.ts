import { useEffect } from "react";

import { DataPoint, PlottedFrame, SimulationData } from '../types/data';
import { FormData } from "types/formData";

async function primeSimulation(formData: FormData): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:8000/simulation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    return response.ok;
  } catch(err) {
    console.error(err);
    return false;
  }
}

async function fetchSimulation() : Promise<SimulationData | null> {
  try {
    const response = await fetch('http://localhost:8000/simulation');

    if (!response.ok) {
      return null;
    }

    const data: DataPoint[] = await response.json();
    const updatedPositionData: PlottedFrame = {};
    const updatedVelocityData: PlottedFrame = {};

    const baseData = () => ({
      x: [],
      y: [],
      z: [],
      type: 'scatter3d',
      mode: 'lines+markers',
      marker: { size: 4 },
      line: { width: 2 },
    });

    data.forEach(([t0, t1, frame]) => {
      for (let [agentId, val] of Object.entries(frame)) {
          if (agentId == "time" || agentId == "timeStep") {
            continue;
          }
          let {position, velocity} = val;
          updatedPositionData[agentId] = updatedPositionData[agentId] || baseData();
          updatedPositionData[agentId].x.push(position.x);
          updatedPositionData[agentId].y.push(position.y);
          updatedPositionData[agentId].z.push(position.z);

          updatedVelocityData[agentId] = updatedVelocityData[agentId] || baseData();
          updatedVelocityData[agentId].x.push(velocity.x);
          updatedVelocityData[agentId].y.push(velocity.y);
          updatedVelocityData[agentId].z.push(velocity.z);
      }
    });

    return {
      data,
      positions: updatedPositionData,
      velocities: updatedVelocityData,
    }
  } catch(err) {
    console.error(err);
    return null;
  } 
}

export function useFetchSimulationData(formData: FormData | null, callback : (data : SimulationData | null) => void) {
  useEffect(() => {
    console.log(formData);
    let canceled = false;

    if (!formData) {
      callback(null);
      return () => {};
    }

    primeSimulation(formData).then((res) => {
      if (!res || canceled) {
        callback(null);
      } else {
        fetchSimulation().then((data) => {
          if (canceled) return;
          callback(data);
        })
      }
    })

    return () => {
      canceled = true;
    }
  }, [formData]);
}