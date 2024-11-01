import { GenericRepository } from "../types/repositoryGenerics";
import { Flow } from "../entities/flow/flow.model";
import { AppDataSource } from "../data-source";
import { CustomError } from "../types";
import { PricingPlan } from "../entities";
import { FlowDto } from "../entities/flow/dtos/flow.dto";
import { handleRepositoryError } from "./errorHandler";
import { EnterpriseRepository } from "./enterprise.repository";

export class FlowRepository extends GenericRepository<Flow> {
  private repository;

  constructor() {
    super(Flow);
    this.repository = AppDataSource.getRepository(Flow);
  }

  public async createFlowWithPricingPlans(data: FlowDto): Promise<Flow> {
    try {
      const pricingPlanRepository = AppDataSource.getRepository(PricingPlan);

      let pricingPlansEntities: PricingPlan[] = [];

      if (data.pricingPlans && data.pricingPlans.length > 0) {
        pricingPlansEntities = await Promise.all(
          data.pricingPlans.map(async (id) => {
            const pricingPlan = await pricingPlanRepository.findOneBy({
              id: id.toString(),
            });
            if (!pricingPlan) {
              throw new CustomError(
                `The PricingPlan with id ${id} was not found`,
                404
              );
            }
            return pricingPlan;
          })
        );
      }

      return this.repository.save({
        name: data.name,
        description: data.description,
        pricingPlans: pricingPlansEntities,
      });
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }

  public async updateFlowWithPricingPlans(
    data: FlowDto,
    flowId: string
  ): Promise<Flow> {
    try {
      const pricingPlanRepository = AppDataSource.getRepository(PricingPlan);

      let pricingPlansEntities: PricingPlan[] = [];

      if (data.pricingPlans && data.pricingPlans.length > 0) {
        pricingPlansEntities = await Promise.all(
          data.pricingPlans.map(async (id) => {
            const pricingPlan = await pricingPlanRepository.findOneBy({
              id: id.toString(),
            });
            if (!pricingPlan) {
              throw new CustomError(
                `The PricingPlan with id ${id} was not found`,
                404
              );
            }
            return pricingPlan;
          })
        );
      }

      const flowToUpdate = await this.findOneBy({ id: flowId });

      if (!flowToUpdate) {
        throw new CustomError(`Flow with id ${flowId} not found`, 404);
      }

      if (data.name) {
        flowToUpdate.name = data.name;
      }

      if (data.description) {
        flowToUpdate.description = data.description;
      }

      if (data.pricingPlans) {
        flowToUpdate.pricingPlans = pricingPlansEntities;
      }

      await this.repository.save(flowToUpdate);

      return flowToUpdate;
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }

  public async getFlowsForPricingPlan(planId: string): Promise<Flow[]> {
    try {
      const entities = this.find({
        where: { pricingPlans: { id: planId } },
      });
      return entities;
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }

  public async getFlowsForPricingPlanAndIdEnterprise(
    idEnterprise: string
  ): Promise<Flow[]> {
    try {
      const enterpriseRepository = new EnterpriseRepository();
      const enterprise =
        await enterpriseRepository.getEnterpriseWithPricingPlan(idEnterprise);
      const entities = this.find({
        where: { pricingPlans: { id: enterprise.pricingPlan.id } },
      });
      return entities;
    } catch (error) {
      throw handleRepositoryError(error);
    }
  }
}
