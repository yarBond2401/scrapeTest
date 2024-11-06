import axios from 'axios';

type Area = {
  name: string;
  adminLevel: number;
};

interface OverpassElement {
  type: string;
  id: number;
  tags?: {
    name?: string;
    'addr:postcode'?: string;
  };
}

class OpenStreetMapService {
  private baseURL: string;

  constructor() {
    this.baseURL = 'http://overpass-api.de/api/interpreter';
  }

  async getStreetsAndZipCodes(
    area: Area,
    parentArea: Area,
  ): Promise<Record<string, string | undefined>> {
    const overpassQuery = `
      [out:json];
      area["name"="${parentArea.name}"]["boundary"="administrative"]["admin_level"="${parentArea.adminLevel}"]->.state;
      area["name"="${area.name}"]["boundary"="administrative"]["admin_level"="${area.adminLevel}"](area.state)->.city;
      (
        way["highway"](area.city);
        node(area)["addr:postcode"];
      );
      out body;
      >;
      out skel qt;
    `;

    try {
      const response = await axios.get(this.baseURL, {
        params: { data: overpassQuery },
      });

      const streets: Record<string, string | undefined> = {};
      for (const element of response.data.elements) {
        if (element.tags) {
          if (element.tags.highway && element.tags.name) {
            streets[element.tags.name] = element.tags['addr:postcode'];
          }
        }
      }

      return streets;
    } catch (error) {
      console.error('Error fetching data from Overpass API:', error);
      throw error;
    }
  }
}

export default new OpenStreetMapService();
