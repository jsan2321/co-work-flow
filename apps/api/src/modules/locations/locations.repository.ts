import { prisma } from "../../prisma/client.js";
import type { Location } from "@prisma/client";
import type { ILocationsRepository } from "./locations.types.js";

export class LocationsRepository implements ILocationsRepository {
  async getActiveLocation(): Promise<Location | null> {
    return prisma.location.findFirst({
      where: { status: "ACTIVE" },
    });
  }

  async findById(id: string): Promise<Location | null> {
    return prisma.location.findUnique({
      where: { id },
    });
  }
}

export const locationsRepository = new LocationsRepository();
