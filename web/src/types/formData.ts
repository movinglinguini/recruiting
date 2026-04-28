export type FormValue = number | '';
export type FormData = {
  Body1: {
    position: {
      x: FormValue;
      y: FormValue;
      z: FormValue;
    }
    velocity: {
      x: FormValue;
      y: FormValue;
      z: FormValue;
    }
    mass: FormValue;
  };
  Body2: {
    position: {
      x: FormValue;
      y: FormValue;
      z: FormValue;
    }
    velocity: {
      x: FormValue;
      y: FormValue;
      z: FormValue;
    }
    mass: FormValue;
  };
}