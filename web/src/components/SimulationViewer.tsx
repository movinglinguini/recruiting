import { Container, Flex, Heading, Separator, Spinner, Table } from '@radix-ui/themes';
import { useFetchSimulationData } from 'hooks/useFetchSimulationData';
import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';
import { Routes } from 'routes';
import { DataFrame, PlottedAgentData, SimulationData } from 'types/data';

export type SimulationViewerProps = {
  simulationData: SimulationData,
}

export function SimulationViewer({ simulationData } : SimulationViewerProps){
  const positionData = Object.values(simulationData.positions);
  const velocityData = Object.values(simulationData.velocities);
  const initialState = simulationData.data[0][2];

  return (
    <Flex direction="column" m="4" width="100%" justify="center" align="center">
      <Heading as="h1" size="8" weight="bold" mb="4">
        Simulation Data
      </Heading>
      <Separator size="4" my="5" />
      <Flex direction="row" width="100%" justify="center">
        <Plot
          style={{ width: '45%', height: '100%', margin: '5px' }}
          data={positionData}
          layout={{
            title: 'Position',
            scene: {
              xaxis: { title: 'X' },
              yaxis: { title: 'Y' },
              zaxis: { title: 'Z' },
            },
            autosize: true,
            dragmode: 'turntable',
          }}
          useResizeHandler
          config={{
            scrollZoom: true,
          }}
        />
        <Plot
          style={{ width: '45%', height: '100%', margin: '5px' }}
          data={velocityData}
          layout={{
            title: 'Velocity',
            scene: {
              xaxis: { title: 'X' },
              yaxis: { title: 'Y' },
              zaxis: { title: 'Z' },
            },
            autosize: true,
            dragmode: 'turntable',
          }}
          useResizeHandler
          config={{
            scrollZoom: true,
          }}
        />
      </Flex>
      <Flex justify="center" width="100%" m="4">
        <Table.Root
          style={{
            width: '800px',
          }}
        >
          {/* Table: https://www.radix-ui.com/themes/docs/components/table */}
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Agent</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Initial Position (x,y, z)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Initial Velocity (x,y,z)</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {Object.entries(initialState).flatMap(
                ([agentId, { position, velocity }]) => {
                  if (position) {
                  return (
              <Table.Row key={agentId}>
                <Table.RowHeaderCell>{agentId}</Table.RowHeaderCell>
                <Table.Cell>
                  ({position.x}, {position.y}, {position.z})
                </Table.Cell>
                <Table.Cell>
                  ({velocity.x}, {velocity.y}, {velocity.z})
                </Table.Cell>
              </Table.Row>
                );} else {
                  return null;
                }
              }
            )}
          </Table.Body>
        </Table.Root>
      </Flex>
    </Flex>
  );
};
