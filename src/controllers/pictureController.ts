import { Request, Response } from "express";
import fs from "fs";
import axios from "axios";
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from "dotenv";

dotenv.config();

export const create = async (req: Request, res: Response) => {
  try {
    const { customer_code, measure_datetime, measure_type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Imagem não encontrada." });
    }

    const imageBuffer = fs.readFileSync(file.path);
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    console.log(process.env.GOOGLE_API_KEY);

    const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY?"AIzaSyDKiOEru_nckoSlP7-UnBFCQdfHXvcP-Xc" : "");
    const model =  genAi.getGenerativeModel({model: 'gemini-1.5-flash'});

    const prompt = "Extraia o valor de medição";

    const image = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg',
      }
    }

    const result = await model.generateContent([prompt, image])

    res.json({
      msg: "Leitura obtida com sucesso.",
      response: result.response.text()
    });
  } catch (error) {
    console.error("Erro ao processar a imagem: ", error);
    res.status(500).json({ message: "Erro ao processar a imagem." });
  }
};