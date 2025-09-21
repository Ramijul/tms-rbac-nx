import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../auth/auth.entity';
import { Role } from '../../permission/role.enum';
import { Organization } from './organization.entity';

@Entity('org_user_roles')
@Unique(['orgId', 'userId'])
export class OrgUserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  orgId: number;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
