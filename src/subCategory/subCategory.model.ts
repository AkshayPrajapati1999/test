import { Field, ObjectType } from "@nestjs/graphql";
import { SessionEntity } from "src/session/session.entity";

@ObjectType()
export class SessionWithUserMinTime {
  @Field(() => [SessionWithMinTime])
  sessionList: SessionWithMinTime[];

  @Field(() => Number)
  totalMinTime: number;
}

@ObjectType()
export class SessionWithMinTime {
  @Field(() => SessionEntity)
  session: SessionEntity;

  @Field(() => Number)
  minTime: number;
}