import { Router } from "express";
import { confirmMeasure, create } from "../controllers/pictureController";
import upload from "../config/multer";

const pictureRouter = Router();

pictureRouter.post("/upload", upload.single("image"), create);
pictureRouter.patch("/confirm", confirmMeasure);

export default pictureRouter;