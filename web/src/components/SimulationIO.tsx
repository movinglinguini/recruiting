import { Button, Flex, Text } from '@radix-ui/themes';
import React, { useCallback, useRef, useState } from 'react';
import { SimulationData } from 'types/data';

function isSimulationData(value: unknown): value is SimulationData {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return (
    Array.isArray(s.data) &&
    !!s.velocities && typeof s.velocities === 'object' &&
    !!s.positions && typeof s.positions === 'object'
  );
}

function isSimulationArray(value: unknown): value is SimulationData[] {
  return Array.isArray(value) && value.every(isSimulationData);
}

export type SimulationIOProps = {
  simulations: SimulationData[];
  onLoad: (sims: SimulationData[]) => void;
};

export function SimulationIO({ simulations, onLoad }: SimulationIOProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(() => {
    const blob = new Blob([JSON.stringify(simulations, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulations.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [simulations]);

  const handleLoadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!isSimulationArray(parsed)) {
          throw new Error('File is not a valid simulations array.');
        }
        onLoad(parsed);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file.');
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  }, [onLoad]);

  return (
    <Flex
      direction="column"
      gap="1"
      mb="3"
      py="2"
      style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--color-background)',
        zIndex: 1,
      }}
    >
      <Flex gap="2" justify="end">
        <Button type="button" variant="soft" size="1" onClick={handleLoadClick}>
          Load
        </Button>
        <Button
          type="button"
          variant="soft"
          size="1"
          onClick={handleSave}
          disabled={simulations.length === 0}
        >
          Save
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Flex>
      {error && <Text size="1" color="red">{error}</Text>}
    </Flex>
  );
}
