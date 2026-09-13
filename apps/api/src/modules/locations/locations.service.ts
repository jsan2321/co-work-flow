import type { Location } from "@prisma/client";
import type { ILocationsRepository, ILocationsService } from "./locations.types.js";
import { locationsRepository } from "./locations.repository.js";
import { NotFoundError } from "../../shared/errors/app-error.js";

export class LocationsService implements ILocationsService {
  constructor(private readonly repo: ILocationsRepository = locationsRepository) {}

  async getActiveLocation(): Promise<Location> {
    const location = await this.repo.getActiveLocation();
    if (!location) {
      throw new NotFoundError("No active location found");
    }
    return location;
  }

  async getLocationById(id: string): Promise<Location | null> {
    return this.repo.findById(id);
  }
}

export const locationsService = new LocationsService();
