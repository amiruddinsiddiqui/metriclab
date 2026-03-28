import express from "express"
import clientDependencies from "../dependencies/dependencies.js"
import authenticate from "../../../shared/middlewares/authenticate.middleware.js"

const router = express.Router();
const { clientController } = clientDependencies.controller;

router.use(authenticate);

router.post('/admin/clients/onboard', (req, res, next) => clientController.createClient(req, res, next));
router.post("/admin/clients/:clientId/users", (req, res, next) => clientController.createClientUser(req, res, next))

export default router;