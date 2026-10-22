import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('redirects')
export class Redirect {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 300 })
  fromPath!: string;

  @Column({ type: 'varchar', length: 300 })
  toPath!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
