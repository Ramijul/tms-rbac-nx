import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { Role, PermissionAction } from '@tms-rbac-nx/data/role.enum';

@Entity('permissions')
@Unique(['role', 'feature', 'action'])
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  role: Role;

  @Column({ type: 'varchar', length: 255 })
  feature: string;

  @Column({ type: 'varchar', length: 50 })
  action: PermissionAction;
}
