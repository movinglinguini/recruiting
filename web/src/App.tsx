import { Box, Flex, Heading, Section, Text } from '@radix-ui/themes';
import { SimulationViewer } from 'components/SimulationViewer';
import { useFetchSimulationData } from 'hooks/useFetchSimulationData';
import { useCallback, useState } from 'react';;
import SimulateForm from 'components/SimulateForm';
import { SimulationData } from 'types/data';
import { LoadingMessage } from 'components/LoadingMessage';
import { FormData } from 'types/formData';

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  // Store plot data in state.
  const [formData, setFormData] = useState<FormData | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [hasError, setHasError] = useState(false);

  useFetchSimulationData(formData, (simulationData : SimulationData | null) => {
    if (simulationData) {
      setHasError(false);
      setSimulationData(simulationData);
    } else {
      setHasError(true);
    }
    setIsLoading(false);
  });

  const onSubmitForm = useCallback((formData: FormData) => {
    setFormData(formData);
    setIsLoading(true);
  }, []);

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
          <Box width="15%" height="100%" p="3" style={{ overflowY: 'auto' }}>
            <SimulateForm isLoading={isLoading} onSubmitForm={onSubmitForm}/>
          </Box>
          <Box width="85%" height="100%" p="3" style={{ overflowY: 'auto' }}>
            {
              simulationData ?
                <SimulationViewer simulationData={simulationData}/>
              : (
                isLoading ?
                  <LoadingMessage/>
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
