import { Form, FormField, FormLabel } from '@radix-ui/react-form';
import { Button, Container, Flex, Heading, IconButton, Spinner, Text, TextField } from '@radix-ui/themes';
import _ from 'lodash';
import React, { FormEvent, forwardRef, memo, useCallback, useImperativeHandle, useState } from 'react';
import { AgentConfigIO } from 'components/AgentConfigIO';
import { BodyData, FormData, FormValue } from 'types/formData';

const FIELDS: { label: string; path: string }[] = [
  { label: 'Initial X-position', path: 'position.x' },
  { label: 'Initial Y-position', path: 'position.y' },
  { label: 'Initial Z-position', path: 'position.z' },
  { label: 'Initial X-velocity', path: 'velocity.x' },
  { label: 'Initial Y-velocity', path: 'velocity.y' },
  { label: 'Initial Z-velocity', path: 'velocity.z' },
  { label: 'Mass', path: 'mass' },
];

const emptyBody = (): BodyData => ({
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  mass: 1,
});

const initialFormData: FormData = {
  Body1: { position: { x: -0.73, y: 0, z: 0 }, velocity: { x: 0, y: -0.0015, z: 0 }, mass: 1 },
  Body2: { position: { x: 60.34, y: 0, z: 0 }, velocity: { x: 0, y: 0.13, z: 0 }, mass: 0.0123 },
};

function nextBodyId(formData: FormData): string {
  let n = 1;
  while (`Body${n}` in formData) n++;
  return `Body${n}`;
}

export type SimulateFormProps = {
  isLoading: boolean,
  onSubmitForm: (formData : FormData) => void,
}

export type SimulateFormHandle = {
  loadFormData: (data: FormData) => void;
};

const SimulateForm = memo(forwardRef<SimulateFormHandle, SimulateFormProps>(({ isLoading, onSubmitForm }, ref) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const handleLoad = useCallback((data: FormData) => {
    setFormData(data);
    setCollapsed(new Set());
  }, []);

  useImperativeHandle(ref, () => ({ loadFormData: handleLoad }), [handleLoad]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue: FormValue = value === '' ? '' : parseFloat(value);
    setFormData((prev) => _.set(_.cloneDeep(prev), name, newValue));
  }, []);

  const handleAddBody = useCallback(() => {
    setFormData((prev) => ({ ...prev, [nextBodyId(prev)]: emptyBody() }));
  }, []);

  const handleRemoveBody = useCallback((id: string) => {
    setFormData((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setCollapsed((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleCollapsed = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSubmit = useCallback((evt: FormEvent) => {
    evt.preventDefault();
    onSubmitForm(formData);
  }, [formData, onSubmitForm]);

  const bodyIds = Object.keys(formData);

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <AgentConfigIO formData={formData} onLoad={handleLoad} />
        {bodyIds.map((bodyId, i) => {
          const isCollapsed = collapsed.has(bodyId);
          return (
            <Flex key={bodyId} direction="column" mt={i === 0 ? '0' : '4'}>
              <Flex justify="between" align="center">
                <Flex
                  align="center"
                  gap="2"
                  onClick={() => toggleCollapsed(bodyId)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  role="button"
                  aria-expanded={!isCollapsed}
                  aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${bodyId}`}
                >
                  <Text size="2" color="gray">{isCollapsed ? '▸' : '▾'}</Text>
                  <Heading as="h2" size="4" weight="bold">{bodyId}</Heading>
                </Flex>
                <IconButton
                  type="button"
                  variant="ghost"
                  color="gray"
                  size="1"
                  onClick={() => handleRemoveBody(bodyId)}
                  aria-label={`Remove ${bodyId}`}
                >
                  ×
                </IconButton>
              </Flex>
              {!isCollapsed && FIELDS.map(({ label, path }) => {
                const fieldName = `${bodyId}.${path}`;
                return (
                  <FormField key={fieldName} name={fieldName}>
                    <FormLabel htmlFor={fieldName}>
                      <Text size="1" color="gray">{label}</Text>
                    </FormLabel>
                    <TextField.Root
                      type="number"
                      id={fieldName}
                      name={fieldName}
                      value={_.get(formData, fieldName) as unknown as FormValue}
                      onChange={handleChange}
                      required
                    />
                  </FormField>
                );
              })}
            </Flex>
          );
        })}
        <Flex justify="center" mt="4">
          <Button type="button" variant="soft" onClick={handleAddBody}>
            + Add Body
          </Button>
        </Flex>
        <Flex justify="center" m="5">
          <Button type="submit" disabled={isLoading || bodyIds.length === 0}>
            {isLoading ? <Spinner/> : "Submit"}
          </Button>
        </Flex>
      </Form>
    </Container>
  );
}));

export default SimulateForm;
