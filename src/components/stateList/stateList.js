import { State } from 'country-state-city';

export const stateList = (countryCode = 'IN') => {
  const data = State.getStatesOfCountry(countryCode).map((state) => ({
    value: state.name,
    displayValue: `${state.name} - ${state.isoCode}`,
  }));

  return data;
};
