import { Router } from "express";
import { confirmMeasure } from "../controllers/pictureController";

const patchRouter = Router();

patchRouter.patch("/confirm", confirmMeasure);

export default patchRouter;