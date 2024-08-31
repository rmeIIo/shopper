import { Request, Response } from "express";
import fs from "fs";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const measures: {
  uuid: string;
  customer_code: any;
  measure_datetime: any;
  measure_type: any;
  measure_value: any;
  confirmed_value: number;
  confirmed: boolean;
  image_url: string;
}[] = [];

export const create = async (req: Request, res: Response) => {
  try {
    const { customer_code, measure_datetime, measure_type } = req.body;
    const file = req.file;

    if (!file || !customer_code || !measure_datetime || !measure_type) {
      return res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "Todos os campos são obrigatórios.",
      });
    }

    if (measure_type !== "WATER" && measure_type !== "GAS") {
      return res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "measure_type deve ser 'WATER' ou 'GAS'.",
      });
    }

    const imageBuffer = fs.readFileSync(file.path);
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    const genAi = new GoogleGenerativeAI(
      "AIzaSyB1BomNjwmYZFXKfrg5g4poyy39nUr8br4"
    );
    const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Extraia o valor de medição";

    const image = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, image]);

    const measure_value = result.response.text();
    const measurementText = result.response.text(); // A string retornada
    const match = measurementText.match(/(\d+)/);
    
    if (match && match[0]) {
      const measure_value = parseInt(match[0], 10); // Converte para inteiro
      const confirmed_value = parseInt(match[0], 10);
      const measureUuid = Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);;
      const imageUrl = saveImageAndGetUrl(base64Image); // Salva a imagem e obtém a URL

      // Armazena a leitura na estrutura de dados em memória
      measures.push({
        uuid: measureUuid,
        customer_code,
        measure_datetime,
        measure_type,
        measure_value: measure_value, // O valor de medição extraído
        confirmed_value,
        confirmed: false, // Inicialmente, a leitura não está confirmada
        image_url: imageUrl
      });

      console.log("Medição armazenada: ", measures);

      // Responde com os dados necessários
      res.status(200).json({
        image_url: imageUrl,
        measure_value: measure_value,
        measure_uuid: measureUuid
      });
    }
  } catch (error) {
    console.error("Erro ao processar a imagem: ", error);
    res.status(500).json({ message: "Erro ao processar a imagem." });
  }
};

export const confirmMeasure = async (req: Request, res: Response) => {
  try {
    const { measure_uuid, confirmed_value } = req.body;

    console.log("Medições armazenadas: ", req.body);

    if (!measure_uuid || typeof confirmed_value !== "number") {
      return res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "measure_uuid e confirmed_value são obrigatórios.",
      });
    }

    const measure = measures.find((m) => m.uuid === measure_uuid);
    if (!measure) {
      return res.status(404).json({
        error_code: "MEASURE_NOT_FOUND",
        error_description: "Leitura do mês já realizada",
      });
    }

    if (measure.confirmed) {
      return res.status(409).json({
        error_code: "CONFIRMATION_DUPLICATE",
        error_description: "Leitura do mês já realizada",
      });
    }

    measure.confirmed_value = confirmed_value;
    measure.confirmed = true;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao confirmar a leitura: ", error);
    res.status(500).json({ message: "Erro ao confirmar a leitura." });
  }
};

function saveImageAndGetUrl(base64Image: string): string {
  if (!base64Image || base64Image.length === 0) {
    throw new Error("A imagem em base64 não está definida ou está vazia.");
  }

  const base64Data = base64Image.split(",")[1] || base64Image;
  const fileName = `uploads/${Date.now()}.jpg`;
  fs.writeFileSync(fileName, base64Data, { encoding: "base64" });

  return `http://localhost:3000/${fileName}`;
}
