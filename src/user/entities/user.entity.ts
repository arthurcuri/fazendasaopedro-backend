import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn} from 'typeorm';
  
  @Entity('users')
  export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    nome: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    senha: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;

    @Column({ nullable: true })
    resetToken?: string;

  @Column({ type: 'datetime', nullable: true })
  resetTokenExpiresAt?: Date;
  }
  