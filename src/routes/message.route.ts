import { MessageController } from "../controllers";
import { genericRoutes } from "../types/routeGenerics";
import { Message } from "../entities";
import { MessageSchema } from "../schemas";
import { MessageDto } from "../entities/message";
import { validateSchema } from "../middlewares";
import { authMiddleware } from "../middlewares/authMiddleware";
import { checkRoleAuth } from "../middlewares/roleProtectionMiddleware";

export const messageRouter = () => {
  const messageRoutes = genericRoutes(
    Message,
    Message,
    MessageDto,
    MessageSchema
  );

  const messageController = new MessageController();

  messageRoutes.get(
    "/getAllWithFlow",
    authMiddleware,
    checkRoleAuth(["admin", "redactor"]),
    (req, res) =>
      /* 
      #swagger.path = '/messages/getAllWithFlow'
      #swagger.tags = ['Message']
      #sagger.description = 'Esta ruta trae todos los mensajes y su relación con flow. Si se prefiere no traer su relación con flow, usar la ruta genérica '/messages/''
      #swagger.security = [{
						"bearerAuth": []
					}]
     
     */
      messageController.findAllMessages(req, res)
  );

  messageRoutes.post(
    "/create",
    authMiddleware,
    checkRoleAuth(["admin", "redactor"]),
    validateSchema(MessageSchema),
    (req, res) =>
      /* 
      #swagger.path = '/messages/create/'
      #swagger.tags = ['Message']
      #sagger.description = 'Esta ruta crea un mensaje y su relación con flow.'
      #swagger.parameters['body'] = {
					in: 'body',
					schema: { $ref: "#/definitions/Messages" }
				}

      #swagger.security = [{
						"bearerAuth": []
					}]
     
     */
      messageController.createMessage(req, res)
  );

  messageRoutes.get(
    "/getMessageAllDeleted",
    authMiddleware,
    checkRoleAuth(["admin"]),
    (req, res) =>
      /* 
      #swagger.path = '/messages/getMessageAllDeleted'
      #swagger.tags = ['Message']
      #sagger.description = 'Esta ruta trae todos los mensajes y su relación con flow, incluyendo los que están dados de baja. Si se prefiere no traer su relación con flow, usar la ruta genérica '/messages/getAllDeleted/'
      #swagger.security = [{
						"bearerAuth": []
					}]
     
     */
      messageController.getMessagesAllDeleted(req, res)
  );

  messageRoutes.get(
    "/getMessageById/:id",
    authMiddleware,
    checkRoleAuth(["admin", "redactor", "empleado"]),
    (req, res) =>
      /* 
      #swagger.path = '/messages/getMessageAllDeleted/{id}'
      #swagger.tags = ['Message']
      #sagger.description = 'Esta ruta traeun mensaje y su relación con flow. Si se prefiere no traer su relación con flow, usar la ruta genérica '/messages/getOne/:id''
      #swagger.security = [{
						"bearerAuth": []
					}]
     
     */
      messageController.getMessageById(req, res)
  );

  messageRoutes.get(
    "/findAllMessagesByNumOrder",
    authMiddleware,
    checkRoleAuth(["admin", "redactor", "cliente"]),
    (req, res) =>
      /* 
      #swagger.path = '/messages/findAllMessagesByNumOrder'
      #swagger.tags = ['Message']
      #sagger.description = 'Esta ruta trae todos los mensajes con un número de orden específico dentro de un flujo y una empresa.'
      #swagger.parameters['idFlow'] = {
          in: 'query',
          name: 'idFlow',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Id de flow'
        }
      #swagger
        #swagger.parameters['numOrder'] = {
          in: 'query',
          name: 'numOrder',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'Número de orden del mensaje'
        }
      #swagger.security = [{
            "bearerAuth": []
          }]
     */
      messageController.findAllMessagesByNumOrder(req, res)
  );

  messageRoutes.get(
    "/findAllMessagesByNumOrderAndFlowByName",
    authMiddleware,
    checkRoleAuth(["admin", "redactor", "cliente"]),
    (req, res) =>
      /* 
      #swagger.path = '/messages/findAllMessagesByNumOrderAndFlowByName'
      #swagger.tags = ['Message']
      #sagger.description = 'Esta ruta trae todos los mensajes con un número de orden específico dentro de un flujo obtenido por el nombre y una empresa.'
      #swagger.parameters['nameFlow'] = {
          in: 'query',
          name: 'nameFlow',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Nombre del flow'
        }
      #swagger
        #swagger.parameters['numOrder'] = {
          in: 'query',
          name: 'numOrder',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'Número de orden del mensaje'
        }
      #swagger.security = [{
            "bearerAuth": []
          }]
     */
      messageController.findAllMessagesByNumOrderAndFlowByName(req, res)
  );

  // messageRoutes.patch("/:id", (req, res) => messageController.update(req, res));
  // messageRoutes.delete("/:id", (req, res) => messageController.delete(req, res));
  // messageRoutes.delete("/logicDelete/:id", (req, res) => messageController.logicDelete(req, res));
  // messageRoutes.patch("/restore/:id", (req, res) => messageController.restoreLogicDeleted(req, res));
  return messageRoutes;
};
