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

  @Column({ type: 'int', nullable: true })
  parentOrgId: number | null;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'parentOrgId' })
  parentOrganization: Organization | null;
}
