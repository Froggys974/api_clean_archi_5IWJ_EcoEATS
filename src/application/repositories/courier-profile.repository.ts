import { CourierProfile } from "@domain/entities/user/courier-profile.entity";

export interface CourierProfileRepository {
  findById(id: string): Promise<CourierProfile | null>;
  findByUserId(userId: string): Promise<CourierProfile | null>;
  findAllAvailable(): Promise<CourierProfile[]>;
  findAll(): Promise<CourierProfile[]>;
  create(profile: CourierProfile): Promise<void>;
  update(profile: CourierProfile): Promise<void>;
  delete(id: string): Promise<void>;
}
