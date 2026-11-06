import { CakeSettingsRepository } from "@/features/repository/CakeSettings/CakeSettings.repository";
import { settingSchema } from "./setting.schema";
import { setActiveAcademicYearCache } from "@/shared/middleware/database-selector";

export namespace CakeSettingsService {
  export const getSettings = async () => {
    const settings = await CakeSettingsRepository.getCakeSettings();
    // console.log(`[${Date.now()}] CakeSettingsService.getSettings: Returned from repository:`, settings);
    return settings;
  };

  export const createSettings = async (data: typeof settingSchema.static) => {
    console.log("CakeSettingsService.createSettings: Data received:", data);
    const formattedData: any = { ...data };

    if (formattedData.pickupStartDate) {
      formattedData.pickupStartDate = new Date(formattedData.pickupStartDate);
    } else if (formattedData.pickupStartDate === "") {
      formattedData.pickupStartDate = null;
    }

    if (formattedData.pickupEndDate) {
      formattedData.pickupEndDate = new Date(formattedData.pickupEndDate);
    } else if (formattedData.pickupEndDate === "") {
      formattedData.pickupEndDate = null;
    }

    const upsertedSettings = await CakeSettingsRepository.upsertCakeSettings(formattedData);
    if (upsertedSettings?.academicYear) {
      setActiveAcademicYearCache(upsertedSettings.academicYear);
    }

    // Also sync active settings into master default DB so system-active-year stays accurate
    try {
      const { getClient } = await import("@/providers/database/connection-manager");
      const defaultClient = getClient();
      const existingInDefault = await defaultClient.cakeSettings.findFirst();
      if (existingInDefault) {
        await defaultClient.cakeSettings.update({
          where: { id: existingInDefault.id },
          data: formattedData,
        });
      } else {
        await defaultClient.cakeSettings.create({
          data: formattedData,
        });
      }
    } catch (syncErr) {
      console.warn("Could not sync settings to default DB:", syncErr);
    }
    console.log("CakeSettingsService.createSettings: Upserted settings returned:", upsertedSettings);
    return upsertedSettings;
  };
}