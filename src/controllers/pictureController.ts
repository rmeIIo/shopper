import { Request, Response } from "express";
import Picture from "../models/Picture";
import fs from "fs";
import { validateBase64 } from "../utils/validateBase64";
import axios from "axios";
import path from "path";

export const create = async (req: Request, res: Response) => {
  try {
    const { image, customer_code, measure_datetime, measure_type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Imagem não encontrada." });
    }

    const measureDate = new Date(measure_datetime);
    const year = measureDate.getFullYear();
    const month = measureDate.getMonth();

    const existingReading = await Picture.findOne({
      customerCode: customer_code,
      measureDatetime: {
        $gte: new Date(year, month, 1), // Primeiro dia do mês
        $lt: new Date(year, month + 1, 1), // Primeiro dia do próximo mês
      },
      measureType: measure_type,
    });

    if (existingReading) {
      return res
        .status(400)
        .json({ message: "Já existe uma leitura para este mês." });
    }

    const imageBuffer = fs.readFileSync(file.path);
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const geminiResponse = await callGeminiApi(base64Image);

    const picture = new Picture({
      name: geminiResponse.guid,
      src: geminiResponse.tempLink,
      customerCode: customer_code,
      measureDatetime: measureDate,
      measureType: measure_type,
    });

    await picture.save();

    res.json({
      picture,
      msg: "Imagem salva com sucesso.",
      value: geminiResponse.value,
    });
  } catch (error) {
    console.error("Erro ao salvar a imagem: ", error);
    res.status(500).json({ message: "Erro ao salvar a imagem." });
  }
};

async function callGeminiApi(image: string) {
  const url =
    `https://southamerica-east1-aiplatform.googleapis.com/v1/projects/gen-lang-client-0770235656/locations/southamerica-east1/publishers/google/models/gemini-1.5-pro:streamGenerateContent?key={${process.env.GEMINI_API_KEY}}`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GEMINI_API_TOKEN}`,
  };

  const body = {
    instances: [
      {
        prompt: "Extraia o valor de medição",
        image: image,
      }
    ],
  };

  try {
    const response = await axios.post(url, body, { headers });
    const data = response.data;

    return {
      tempLink: data.tempLink,
      guid: data.guid,
      value: data.value,
    };
  } catch (error) {
    console.error("Erro ao chamar a API do Gemini: ", error);
    throw new Error("Falha na integração com a API do Gemini.");
  }
}
