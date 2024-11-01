import { Expose, Type } from "class-transformer";
import { Enterprise, EnterpriseDto } from "../../enterprise";
import { FlowDto } from "../../flow/dtos/flow.dto";
import { Flow } from "../../flow/flow.model";

export class MessageDto {
  @Expose()
  numOrder!: number;

  @Expose()
  body!: string;

  @Expose()
  @Type(() => EnterpriseDto)
  enterprise?: Enterprise;

  @Expose()
  @Type(() => FlowDto)
  flow?: Flow;
}
