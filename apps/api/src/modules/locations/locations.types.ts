import type { Location } from "@prisma/client";

export interface ILocationsRepository {
  getActiveLocation(): Promise<Location | null>;
  findById(id: string): Promise<Location | null>;
}

export interface ILocationsService {
  getActiveLocation(): Promise<Location>;
  getLocationById(id: string): Promise<Location | null>;
}
