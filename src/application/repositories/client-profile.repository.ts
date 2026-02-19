import { ClientProfile } from "@domain/entities/user/client-profile.entity";

export interface ClientProfileRepository {
  findById(id: string): Promise<ClientProfile | null>;
  findByUserId(userId: string): Promise<ClientProfile | null>;
  findAll(): Promise<ClientProfile[]>;
  create(profile: ClientProfile): Promise<void>;
  update(profile: ClientProfile): Promise<void>;
  delete(id: string): Promise<void>;
}
