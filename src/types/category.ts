export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
