import { Message } from "../entities";
import { GenericRepository } from "../types/repositoryGenerics";
import { AppDataSource } from "../data-source";
import { CustomError } from "../types";
import { EnterpriseRepository } from "./enterprise.repository";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { MessageDto } from "../entities/message";
import { handleRepositoryError } from "./errorHandler";
import { FlowRepository } from "./flow.repository";
import { validate as isUuid } from "uuid";

export class MessageRepository extends GenericRepository<Message> {
  private repository;
  private flowRepository = new FlowRepository();

  constructor() {
    super(Message);
    this.repository = AppDataSource.getRepository(Message);
    this.flowRepository = new FlowRepository();
  }

  public async findAllMessages(idEnterprise: string): Promise<Message[]> {
    try {
      const entities = await this.repository.find({
        where: { enterprise: { id: idEnterprise } },
        relations: ["flow"],
      });
      return entities;
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }

  public async findAllDeletedMessages(
    idEnterprise: string
  ): Promise<Message[]> {
    try {
      const entities = await this.repository.find({
        where: { enterprise: { id: idEnterprise } },
        relations: ["flow"],
        withDeleted: true,
      });
      return entities;
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }

  public async findMessageById(
    id: string,
    idEnterprise: string
  ): Promise<Message> {
    try {
      const entity = await this.repository.findOne({
        where: {
          id: id,
          enterprise: { id: idEnterprise },
        },
        relations: ["flow"],
      });

      if (!entity) {
        throw new CustomError("Entity not found", 404);
      }

      return entity;
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }

  public async findAllMessagesByNumOrder(
    idEnterprise: string,
    idFlow: string,
    numOrder: number
  ): Promise<Message[]> {
    try {
      const entityFlow = await this.flowRepository.findOne({
        where: { id: idFlow },
      });

      if (!entityFlow) {
        throw new CustomError("Flow not found", 404);
      }

      const entities = await this.repository.find({
        where: {
          enterprise: { id: idEnterprise },
          numOrder: numOrder,
          flow: { id: idFlow },
        },
      });

      if (entities.length <= 0) {
        throw new CustomError("Message not found", 404);
      }

      return entities;
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }

  public async findAllMessagesByNumOrderAndFlowByName(
    idEnterprise: string,
    nameFlow: string,
    numOrder: number
  ): Promise<Message[]> {
    try {
      const entityFlow = await this.flowRepository.findOne({
        where: { name: nameFlow },
      });

      if (!entityFlow) {
        throw new CustomError("Flow not found", 404);
      }

      const entities = await this.repository.find({
        where: {
          enterprise: { id: idEnterprise },
          numOrder: numOrder,
          flow: { id: entityFlow.id },
        },
      });

      if (entities.length <= 0) {
        throw new CustomError("Message not found", 404);
      }

      return entities;
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }

  public async createMessage(
    data: MessageDto,
    idFlow: string,
    idEnterprise: string
  ): Promise<Message> {
    try {
      const enterpriseRepository = new EnterpriseRepository();

      // Buscar la empresa
      const entityEnterprise = await enterpriseRepository.findOne({
        where: { id: idEnterprise },
        relations: ["pricingPlan"],
      });
      if (!entityEnterprise) {
        throw new CustomError("Enterprise not found", 404);
      }

      // Asignarle la empresa a message
      data.enterprise = entityEnterprise;

      // Validar existencia del flow
      if (!idFlow) {
        throw new CustomError("Flow not provided", 400);
      }

      if (!isUuid(idFlow)) {
        throw new CustomError("Invalid flow ID format", 400);
      }
      const entityFlow = await this.flowRepository.findOne({
        where: { id: idFlow },
        relations: ["pricingPlans"],
      });

      if (!entityFlow) {
        throw new CustomError("Flow not found", 404);
      }

      // Validar que el flujo pertenece al plan de precios de la empresa
      const enterprisePlanId = entityEnterprise.pricingPlan.id;
      if (!enterprisePlanId) {
        throw new CustomError("Enterprise does not have an assigned plan", 400);
      }
      const flowPlans = entityFlow.pricingPlans;
      const isFlowInEnterprisePlan = flowPlans.some(
        (plan) => plan.id === enterprisePlanId
      );
      if (!isFlowInEnterprisePlan) {
        throw new CustomError(
          "The flow does not belong to the enterprise's contracted plan",
          400
        );
      }

      // Guarda message en la base de datos junto con la relación de flow y enterprise
      const newEntity = await this.repository.save(data);
      return newEntity;
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }

  public async updateEntityByEnterprise(
    data: QueryDeepPartialEntity<MessageDto>,
    idMessage: string,
    idEnterprise: string
  ): Promise<Message | CustomError> {
    try {
      const updatedEntity = await this.update(
        {
          id: idMessage,
          enterprise: { id: idEnterprise },
        },
        data
      );
      if (updatedEntity.affected) {
        const newEntity = await this.findMessageById(idMessage, idEnterprise);
        return newEntity;
      } else {
        throw new CustomError("Entity not found", 404);
      }
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }

  public async deleteEntityByEnterprise(
    id: string,
    idEnterprise: string
  ): Promise<Message | CustomError> {
    try {
      const entity = await this.findMessageById(id, idEnterprise);
      if (!entity) {
        throw new CustomError("Entity not found", 404);
      }
      const deletedEntity = await this.delete({
        id: id,
        enterprise: { id: idEnterprise },
      });
      if (deletedEntity.affected) {
        return entity;
      } else {
        throw new CustomError("Entity not found", 404);
      }
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }

  public async logicDeleteByEnterprise(
    id: string,
    idEnterprise: string
  ): Promise<Message | CustomError> {
    try {
      const entity = await this.findMessageById(id, idEnterprise);
      if (!entity) {
        throw new CustomError("Entity not found", 404);
      }
      const deletedEntity = await this.softDelete(id);
      if (deletedEntity.affected) {
        return entity;
      } else {
        throw new CustomError("Entity not found", 404);
      }
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }

  public async restoreLogicDeletedByEnterprise(
    id: string,
    idEnterprise: string
  ): Promise<Message | CustomError> {
    try {
      const entity = await this.findMessageById(id, idEnterprise);
      if (!entity) {
        throw new CustomError("Entity not found", 404);
      }
      const restoredEntity = await this.restore(id);
      if (restoredEntity.affected) {
        return entity;
      } else {
        throw new CustomError("Entity not found", 404);
      }
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }
}
