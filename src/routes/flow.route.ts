import { genericRoutes } from "../types/routeGenerics";
import { Flow } from "../entities";
import { FlowSchema } from "../schemas";
import { FlowDto } from "../entities/flow/dtos/flow.dto";
import { FlowController } from "../controllers/flow.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateSchema } from "../middlewares";
// import { Router } from "express";

export const flowRouter = () => {
  const flowRoutes = genericRoutes(Flow, Flow, FlowDto, FlowSchema); // lo comenté porque funciona raro cuando se sobreescriben los endpoints
  // const flowRoutes = Router();

  const flowController = new FlowController();

  flowRoutes.get(
    "/enterprise/:idEnterprise",
    authMiddleware,
    async (req, res) =>
      /* 
      #swagger.path = '/flows/enterprise/{idEnterprise}'
      #swagger.tags = ['Flow']
      #swagger.description = 'Devuelve los flujos a los que la empresa puede acceder debido a su plan de precios'
      #swagger.parameters['idEnterprise'] = {
        in: 'path',
        required: true,
        type: 'string',
      }

      #swagger.security = [{
        "bearerAuth": []
      }]
      */
      flowController.getFlowsForPricingPlanAndIdEnterprise(req, res)
  );

  flowRoutes.get("/forPricingPlan/:planId", authMiddleware, async (req, res) =>
    /* 
      #swagger.path = '/flows/forPricingPlan/{planId}'
      #swagger.tags = ['Flow']
      #swagger.description = 'Devuelve los flujos de un plan especificado'
      #swagger.parameters['planId'] = {
        in: 'path',
        required: true,
        type: 'string',
      }
      #swagger.security = [{
        "bearerAuth": []
      }]
      */
    flowController.getFlowsForPricingPlan(req, res)
  );

  flowRoutes.post(
    "/create",
    authMiddleware,
    validateSchema(FlowSchema),
    (req, res) =>
      /* 
        #swagger.path = '/flows/create'
        #swagger.tags = ['Flow']
        #swagger.parameters['body'] = {
          in: 'body',
          schema: { $ref: "#/definitions/Flows" }
				}

        #swagger.security = [{
              "bearerAuth": []
            }]
      */
      flowController.createFlow(req, res)
  );

  flowRoutes.patch(
    "/update/:id",
    authMiddleware,
    validateSchema(FlowSchema, true),
    (req, res) =>
      /* 
      #swagger.path = '/flows/update/{id}'
      #swagger.tags = ['Flow']
      #swagger.parameters['body'] = {
					in: 'body',
					schema: { $ref: "#/definitions/Flows" }
				}

      #swagger.security = [{
						"bearerAuth": []
					}]
     
     */
      flowController.updateFlow(req, res)
  );

  // flowRoutes.get("/", (req, res) => flowController.getAll(req, res));
  // flowRoutes.get("/getAllDeleted/", (req, res) => flowController.getAllDeleted(req, res));
  // flowRoutes.get("/getById/:id", (req, res) => flowController.getById(req, res));
  // flowRoutes.delete("/:id", (req, res) => flowController.delete(req, res));
  // flowRoutes.delete("/logicDelete/:id", (req, res) => flowController.logicDelete(req, res));
  // flowRoutes.patch("/restore/:id", (req, res) => flowController.restoreLogicDeleted(req, res));

  return flowRoutes;
};
