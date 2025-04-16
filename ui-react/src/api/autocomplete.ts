export interface City {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  region: string;
  regionCode: string;
}

export async function autocompleteCities(input: string): Promise<City[]> {
  if (input.length < 3) {
    return [];
  }

  const response = await fetch(
    `http://geodb-free-service.wirefreethought.com/v1/geo/places?namePrefix=${input}&types=CITY&sort=-population,countryCode`
  );

  if (!response.ok) {
    throw new Error("error fetching cities");
  }

  const data = await response.json();
  return data.data;
}
