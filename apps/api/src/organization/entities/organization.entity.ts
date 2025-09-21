import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int', nullable: true, name: 'parent_org_id' })
  parentOrgId: number | null;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'parent_org_id' })
  parentOrganization: Organization | null;
}
