import { CakeSettingsRepository } from "@/features/repository/CakeSettings/CakeSettings.repository";
import { settingSchema } from "./setting.schema";

export namespace CakeSettingsService {
  export const getSettings = async () => {
    const settings = await CakeSettingsRepository.getCakeSettings();
    // console.log(`[${Date.now()}] CakeSettingsService.getSettings: Returned from repository:`, settings);
    return settings;
  };

  export const createSettings = async (data: typeof settingSchema.static) => {
    console.log("CakeSettingsService.createSettings: Data received:", data);
    const upsertedSettings = await CakeSettingsRepository.upsertCakeSettings(data);
    console.log("CakeSettingsService.createSettings: Upserted settings returned:", upsertedSettings);
    return upsertedSettings;
  }
}