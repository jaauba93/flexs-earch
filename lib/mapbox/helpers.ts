export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

export const POLAND_BOUNDS: [number, number, number, number] = [14.1, 49.0, 24.2, 54.9]
export const POLAND_CENTER: [number, number] = [19.5, 52.1]
export const POLAND_ZOOM = 5.5

export const CITY_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  warszawa: { center: [21.0122, 52.2297], zoom: 11.5 },
  krakow: { center: [19.9449, 50.0647], zoom: 11.5 },
  wroclaw: { center: [17.0385, 51.1079], zoom: 11.5 },
  trojmiasto: { center: [18.6466, 54.3520], zoom: 11 },
  poznan: { center: [16.9252, 52.4064], zoom: 11.5 },
  katowice: { center: [19.0238, 50.2649], zoom: 11.5 },
  lodz: { center: [19.4553, 51.7592], zoom: 11.5 },
}
