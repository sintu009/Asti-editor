
import { toast } from "sonner";
import {
  env,
  AutoModel,
  AutoProcessor,
  RawImage,
  PreTrainedModel,
  Processor,
} from "@huggingface/transformers";

// Configure transformers.js to use browser cache
env.allowLocalModels = false;
env.useBrowserCache = true;

// Model configuration
const MODEL_ID = "briaai/RMBG-1.4";

interface ModelState {
  model: PreTrainedModel | null;
  processor: Processor | null;
  currentModelId: string;
  isInitialized: boolean;
}

const state: ModelState = {
  model: null,
  processor: null,
  currentModelId: MODEL_ID,
  isInitialized: false,
};

// Initialize the model based on the selected model ID
export async function initializeModel(): Promise<boolean> {
  try {
    if (state.isInitialized) return true;
    
    console.log('Initializing background removal model...');
    
    if (env.backends?.onnx?.wasm) {
      env.backends.onnx.wasm.proxy = true;
    }

    state.model = await AutoModel.from_pretrained(MODEL_ID, {
      config: {
        model_type: "custom",
        is_encoder_decoder: false,
        max_position_embeddings: 0,
        "transformers.js_config": {
          kv_cache_dtype: undefined,
          free_dimension_overrides: undefined,
          device: undefined,
          dtype: undefined,
          use_external_data_format: undefined,
        },
        normalized_config: undefined,
      },
    });

    state.processor = await AutoProcessor.from_pretrained(MODEL_ID, {
      config: {
        do_normalize: true,
        do_pad: false,
        do_rescale: true,
        do_resize: true,
        image_mean: [0.5, 0.5, 0.5],
        feature_extractor_type: "ImageFeatureExtractor",
        image_std: [1, 1, 1],
        resample: 2,
        rescale_factor: 1 / 255,
        size: { width: 1024, height: 1024 },
      },
    });

    state.currentModelId = MODEL_ID;
    state.isInitialized = true;
    
    console.log('Background removal model initialized successfully');
    return true;
  } catch (error) {
    console.error("Error initializing model:", error);
    state.isInitialized = false;
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to initialize background removal model"
    );
  }
}

// AI-powered background removal function using the RMBG model
export const removeImageBackground = async (imageFile: File): Promise<string> => {
  const toastId = toast.loading("Removing background with AI...");
  
  try {
    // Initialize the model if not already done
    if (!state.isInitialized) {
      toast.loading("Loading AI model...", { id: toastId });
      await initializeModel();
    }
    
    if (!state.model || !state.processor) {
      throw new Error("Model not initialized properly.");
    }
    
    toast.loading("Processing image...", { id: toastId });
    console.log('Image size:', imageFile.size, 'bytes');
    console.log('Image type:', imageFile.type);
    
    // Create raw image from file
    const img = await RawImage.fromURL(URL.createObjectURL(imageFile));
    console.log(`Image dimensions: ${img.width}x${img.height}`);
    
    // Pre-process image
    const { pixel_values } = await state.processor(img);
    
    // Predict alpha matte
    const { output } = await state.model({ input: pixel_values });
    
    // Resize mask back to original size
    const maskData = (
      await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(
        img.width,
        img.height
      )
    ).data;
    
    // Create new canvas
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      throw new Error("Could not get 2d context");
    }
    
    // Draw original image output to canvas
    ctx.drawImage(img.toCanvas(), 0, 0);
    
    // Update alpha channel with the mask
    const pixelData = ctx.getImageData(0, 0, img.width, img.height);
    for (let i = 0; i < maskData.length; ++i) {
      pixelData.data[4 * i + 3] = maskData[i];
    }
    ctx.putImageData(pixelData, 0, 0);
    
    // Convert to base64
    const resultBase64 = canvas.toDataURL('image/png');
    
    toast.success("Background removed successfully!", { id: toastId });
    return resultBase64;
  } catch (error) {
    console.error("Error removing background:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    
    toast.error("Failed to remove background. Using original image.", { id: toastId });
    
    // Fallback to original image
    const originalImage = await fileToBase64(imageFile);
    return originalImage;
  }
};

// Helper function to convert Blob to base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

export const createImageElement = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to create image"));
    img.src = src;
  });
};
