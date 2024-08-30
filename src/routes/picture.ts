import { Router } from "express";
import { create } from "../controllers/pictureController";
import upload from "../config/multer";

const pictureRouter = Router();

pictureRouter.post("/upload", upload.single("image"), create);

export default pictureRouter;