import { Box, Flex, Heading, Section, Text } from '@radix-ui/themes';
import { SimulationIO } from 'components/SimulationIO';
import { SimulationViewer } from 'components/SimulationViewer';
import { useFetchSimulationData } from 'hooks/useFetchSimulationData';
import { useCallback, useRef, useState } from 'react';
import SimulateForm, { SimulateFormHandle } from 'components/SimulateForm';
import { DataFrame, SimulationData } from 'types/data';
import { LoadingMessage } from 'components/LoadingMessage';
import { FormData } from 'types/formData';
import _ from 'lodash';

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  // Store plot data in state.
  const [formData, setFormData] = useState<FormData | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [hasError, setHasError] = useState(false);
  const simulateFormRef = useRef<SimulateFormHandle>(null);

  useFetchSimulationData(formData, (sd : SimulationData | null) => {
    if (sd) {
      setHasError(false);
      setSimulationData([...simulationData, sd]);
    } else if (formData) {
      setHasError(true);
    }
    setIsLoading(false);
  });

  const onSubmitForm = useCallback((next: FormData) => {
    if (_.isEqual(next, formData)) return;
    setFormData(next);
    setIsLoading(true);
  }, [formData]);

  const onLoadSimulations = useCallback((sims: SimulationData[]) => {
    setSimulationData(sims);
    setHasError(false);
  }, []);

  const onRemoveSimulation = (simulationIdx : number) => {
    setSimulationData([...simulationData.slice(0, simulationIdx), ...simulationData.slice(simulationIdx + 1)]);
  }

  const onLoadParameters = useCallback((dataFrame: DataFrame) => {
    const next: FormData = {};
    for (const [agentId, agent] of Object.entries(dataFrame)) {
      next[agentId] = {
        position: { x: agent.position.x, y: agent.position.y, z: agent.position.z },
        velocity: { x: agent.velocity.x, y: agent.velocity.y, z: agent.velocity.z },
        mass: agent.mass,
      };
    }
    simulateFormRef.current?.loadFormData(next);
  }, []);

  const renderSimulations = (() => {
    return simulationData.map((sd, idx) => (
      <>
        <SimulationViewer 
          key={`sim-${idx}`} 
          onLoadParameters={onLoadParameters} 
          onRemoveSimulation={onRemoveSimulation} 
          simulationIdx={idx} 
          simulationData={sd}/>
        <hr/>
      </>
    ));
  });

  return (
    <Flex direction="column" style={{ height: '100vh', overflow: 'hidden' }}>
      <Section p="1rem" flexShrink="0">
        <Flex>
          <img src="/favicon.ico"/>
          <Heading as="h1" size="8" style={{ marginLeft: "1rem" }}>Sedaro Nano</Heading>
        </Flex>
      </Section>
      <Section p="0" style={{ flex: 1, minHeight: 0 }}>
        <Flex width="100%" height="100%">
          <Box width="15%" height="100%" p="3" style={{ overflowY: 'auto', paddingTop: '0px' }}>
            <SimulateForm ref={simulateFormRef} isLoading={isLoading} onSubmitForm={onSubmitForm}/>
          </Box>
          <Box width="85%" height="100%" p="3" style={{ overflowY: 'auto', paddingTop: '0px' }}>
            <SimulationIO simulations={simulationData} onLoad={onLoadSimulations} />
            {
              isLoading ?
                  <LoadingMessage/>
              : (
                simulationData.length > 0 ? renderSimulations()
                : (
                  hasError ?
                    <Text>An error occurred while fetching the simulation data.</Text>
                  : <Text>Run a simulation.</Text>
                )
              )
            }
          </Box>
        </Flex>
      </Section>
    </Flex>
  );
};

export default App;
