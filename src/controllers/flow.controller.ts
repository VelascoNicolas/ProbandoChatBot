import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { FlowDto } from "../entities/flow/dtos/flow.dto";
import { Flow } from "../entities/flow/flow.model";
import { FlowRepository } from "../repositories/flow.repository";
import { GenericController } from "../types/controllerGenerics";
import { handleErrors, toDtoFromEntity } from "../utils";

export class FlowController extends GenericController<Flow, FlowDto> {
  private flowRepository: FlowRepository;

  constructor() {
    super(Flow, Flow, FlowDto);
    this.flowRepository = new FlowRepository();
  }

  createFlow = async (req: Request, res: Response) => {
    try {
      const newFlow = await this.flowRepository.createFlowWithPricingPlans(
        plainToInstance(FlowDto, req.body, { groups: ["private"] })
      );
      return res.status(201).json(newFlow);
    } catch (error: unknown) {
      return handleErrors(error, res);
    }
  };

  updateFlow = async (req: Request, res: Response) => {
    try {
      const flowId = req.params.id;
      const updatedFlow = await this.flowRepository.updateFlowWithPricingPlans(
        req.body,
        flowId
      );

      return res.status(200).json(updatedFlow);
    } catch (error: unknown) {
      return handleErrors(error, res);
    }
  };

  getFlowsForPricingPlan = async (req: Request, res: Response) => {
    try {
      const planId = req.params.planId;
      const flows = await this.flowRepository.getFlowsForPricingPlan(planId);
      const entitiesDTO = flows.map((entity) => {
        return toDtoFromEntity(FlowDto, entity);
      });
      return res.status(200).json(entitiesDTO);
    } catch (error: unknown) {
      return handleErrors(error, res);
    }
  };

  getFlowsForPricingPlanAndIdEnterprise = async (
    req: Request,
    res: Response
  ) => {
    try {
      const idEnterprise = req.params.idEnterprise;
      const flows =
        await this.flowRepository.getFlowsForPricingPlanAndIdEnterprise(
          idEnterprise
        );

      const entitiesDTO = flows.map((entity) => {
        return toDtoFromEntity(FlowDto, entity);
      });
      return res.status(200).json(entitiesDTO);
    } catch (error: unknown) {
      return handleErrors(error, res);
    }
  };
}
