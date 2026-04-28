export type FormValue = number | '';

export type BodyData = {
  position: {
    x: FormValue;
    y: FormValue;
    z: FormValue;
  };
  velocity: {
    x: FormValue;
    y: FormValue;
    z: FormValue;
  };
  mass: FormValue;
};

export type FormData = Record<string, BodyData>;
