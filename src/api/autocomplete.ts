export interface City {
  id: number;
  name: string;
  country: string;
}

export async function autocompleteCities(input: string): Promise<City[]> {
  if (input.length < 2) {
    return [];
  }

  const response = await fetch(
    `http://geodb-free-service.wirefreethought.com/v1/geo/places?namePrefix=${input}`
  );

  if (!response.ok) {
    throw new Error("error fetching cities");
  }

  const data = await response.json();
  return data.data;
}
