export interface Status {
  id: number;
  name: string;
  description?: string;
  isSystem: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
