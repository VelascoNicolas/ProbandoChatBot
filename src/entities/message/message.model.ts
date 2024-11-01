import { Entity, Column, ManyToOne } from "typeorm";
import { Base } from "../base/base.model";
import { Enterprise } from "../enterprise";
import { Flow } from "../flow/flow.model";

@Entity("messages")
export class Message extends Base {
  @Column({
    nullable: false,
  })
  numOrder!: number;

  @Column({
    nullable: false,
  })
  body!: string;

  @ManyToOne(() => Enterprise, (enterprise) => enterprise.messages, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    cascade: true,
    nullable: false,
  })
  enterprise!: Enterprise;

  @ManyToOne(() => Flow, (flow) => flow.messages, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    cascade: true,
    nullable: false,
  })
  flow!: Flow;
}
