import { AbstractEntity } from 'src/database/entities/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'user' })
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
}
