import { AbstractEntity } from 'src/database/entities/abstract.entity';
import { Column, Entity, Unique } from 'typeorm';

@Entity({ name: 'user' })
@Unique(['email'])
export class UserEntity extends AbstractEntity {
  @Column({ type: 'varchar', nullable: false })
  first_name: string;

  @Column({ type: 'varchar', nullable: true })
  middle_name: string;

  @Column({ type: 'varchar', nullable: false })
  last_name: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', nullable: false })
  password_salt: string;

  @Column({ type: 'varchar', nullable: false })
  otp: string;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  otp_expiry: Date;
}
