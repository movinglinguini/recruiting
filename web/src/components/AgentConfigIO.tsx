import { Button, Flex, Text } from '@radix-ui/themes';
import React, { useCallback, useRef, useState } from 'react';
import { FormData } from 'types/formData';

function isVec(v: unknown): boolean {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return ['x', 'y', 'z'].every((k) => typeof o[k] === 'number' || o[k] === '');
}

function isValidFormData(value: unknown): value is FormData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  for (const body of Object.values(value as Record<string, unknown>)) {
    if (!body || typeof body !== 'object') return false;
    const b = body as Record<string, unknown>;
    if (!isVec(b.position) || !isVec(b.velocity)) return false;
    if (typeof b.mass !== 'number' && b.mass !== '') return false;
  }
  return true;
}

export type AgentConfigIOProps = {
  formData: FormData;
  onLoad: (data: FormData) => void;
};

export function AgentConfigIO({ formData, onLoad }: AgentConfigIOProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(() => {
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agents.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [formData]);

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
        if (!isValidFormData(parsed)) {
          throw new Error('File is not a valid agent configuration.');
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
        <Button type="button" variant="soft" size="1" onClick={handleSave}>
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
